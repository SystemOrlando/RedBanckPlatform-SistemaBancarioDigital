package com.redbanck.api.auth;

import com.redbanck.api.auth.dto.AuthDtos.*;
import com.redbanck.api.user.User;
import com.redbanck.api.user.UserDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Tag(name = "Autenticación", description = "Registro, login y gestión de sesión")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/auth/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Registrar un nuevo usuario",
            description = "Crea el usuario, su cuenta inicial con bono de bienvenida y devuelve los tokens de sesión.")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/auth/login")
    @Operation(summary = "Iniciar sesión con documento y contraseña",
            description = "Tras 5 intentos fallidos la cuenta se bloquea temporalmente por 15 minutos.")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/auth/refresh")
    @Operation(summary = "Renovar la sesión con un refresh token",
            description = "El refresh token se rota: el presentado queda revocado y se emite un par nuevo.")
    public AuthResponse refresh(@Valid @RequestBody RefreshRequest request) {
        return authService.refresh(request.refreshToken());
    }

    @PostMapping("/auth/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Cerrar sesión (revoca el refresh token)")
    public void logout(@Valid @RequestBody RefreshRequest request) {
        authService.logout(request.refreshToken());
    }

    @GetMapping("/users/me")
    @Operation(summary = "Perfil del usuario autenticado")
    public UserDto me(@AuthenticationPrincipal User user) {
        return UserDto.from(user);
    }
}
