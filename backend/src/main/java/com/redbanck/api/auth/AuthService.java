package com.redbanck.api.auth;

import com.redbanck.api.account.AccountService;
import com.redbanck.api.auth.dto.AuthDtos.AuthResponse;
import com.redbanck.api.auth.dto.AuthDtos.LoginRequest;
import com.redbanck.api.auth.dto.AuthDtos.RegisterRequest;
import com.redbanck.api.common.BusinessException;
import com.redbanck.api.limits.LimitsService;
import com.redbanck.api.security.JwtService;
import com.redbanck.api.security.SecurityProperties;
import com.redbanck.api.user.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final AccountService accountService;
    private final LimitsService limitsService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final SecurityProperties props;
    private final SecureRandom random = new SecureRandom();

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByDocumentId(request.documentId())) {
            throw BusinessException.conflict("Ya existe un usuario con ese documento");
        }
        if (userRepository.existsByEmail(request.email().toLowerCase())) {
            throw BusinessException.conflict("Ya existe un usuario con ese email");
        }

        User user = userRepository.save(User.builder()
                .documentId(request.documentId())
                .firstName(request.firstName().trim())
                .lastName(request.lastName().trim())
                .email(request.email().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(Role.USER)
                .build());

        accountService.openInitialAccount(user);
        limitsService.createDefaults(user);

        return issueTokens(user);
    }

    /**
     * Restricciones de login:
     * - Usuario bloqueado por administrador: 403.
     * - Bloqueo temporal tras {@code maxFailedAttempts} intentos fallidos: 423.
     * - Credenciales incorrectas: mensaje genérico (evita enumeración de usuarios).
     *
     * noRollbackFor: el contador de intentos fallidos debe persistirse aunque
     * el login termine lanzando la excepción de credenciales inválidas.
     */
    @Transactional(noRollbackFor = BusinessException.class)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByDocumentId(request.documentId())
                .orElseThrow(() -> BusinessException.unauthorized("Credenciales inválidas"));

        if (user.getStatus() == UserStatus.BLOCKED) {
            throw BusinessException.forbidden("Tu usuario está bloqueado. Contacta a soporte.");
        }

        if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(Instant.now())) {
            long minutes = Math.max(1, Duration.between(Instant.now(), user.getLockedUntil()).toMinutes());
            throw new BusinessException(HttpStatus.LOCKED,
                    "Demasiados intentos fallidos. Intenta de nuevo en " + minutes + " min.");
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            registerFailedAttempt(user);
            throw BusinessException.unauthorized("Credenciales inválidas");
        }

        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        return issueTokens(user);
    }

    /** Rotación de refresh tokens: cada uso revoca el token y emite un par nuevo. */
    @Transactional
    public AuthResponse refresh(String refreshToken) {
        RefreshToken stored = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> BusinessException.unauthorized("Sesión inválida"));

        if (stored.isRevoked()) {
            // Reuso de un token ya rotado: posible robo. Se revocan todas las sesiones.
            log.warn("Reuso de refresh token detectado para el usuario {}", stored.getUser().getId());
            refreshTokenRepository.revokeAllByUser(stored.getUser());
            throw BusinessException.unauthorized("Sesión inválida. Inicia sesión de nuevo.");
        }
        if (!stored.isUsable() || stored.getUser().getStatus() != UserStatus.ACTIVE) {
            throw BusinessException.unauthorized("Sesión expirada. Inicia sesión de nuevo.");
        }

        stored.setRevoked(true);
        return issueTokens(stored.getUser());
    }

    @Transactional
    public void logout(String refreshToken) {
        refreshTokenRepository.findByToken(refreshToken)
                .ifPresent(token -> token.setRevoked(true));
    }

    private void registerFailedAttempt(User user) {
        int attempts = user.getFailedLoginAttempts() + 1;
        user.setFailedLoginAttempts(attempts);
        if (attempts >= props.maxFailedAttempts()) {
            user.setLockedUntil(Instant.now().plus(Duration.ofMinutes(props.lockMinutes())));
            user.setFailedLoginAttempts(0);
            log.warn("Usuario {} bloqueado temporalmente por intentos fallidos", user.getId());
        }
    }

    private AuthResponse issueTokens(User user) {
        byte[] bytes = new byte[48];
        random.nextBytes(bytes);
        String refreshValue = HexFormat.of().formatHex(bytes);

        refreshTokenRepository.save(RefreshToken.builder()
                .token(refreshValue)
                .user(user)
                .expiresAt(Instant.now().plus(Duration.ofDays(props.refreshTokenDays())))
                .build());

        return new AuthResponse(
                jwtService.createAccessToken(user),
                refreshValue,
                jwtService.accessTokenSeconds(),
                UserDto.from(user)
        );
    }
}
