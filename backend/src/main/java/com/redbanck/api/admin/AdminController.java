package com.redbanck.api.admin;

import com.redbanck.api.account.AccountRepository;
import com.redbanck.api.auth.RefreshTokenRepository;
import com.redbanck.api.common.BusinessException;
import com.redbanck.api.transaction.TransactionRepository;
import com.redbanck.api.transaction.TransactionType;
import com.redbanck.api.user.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.UUID;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@Tag(name = "Administración", description = "Panel administrativo (solo rol ADMIN)")
public class AdminController {

    private static final ZoneId ZONE = ZoneId.of("America/Lima");

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    public record AdminUserDto(
            String id,
            String documentId,
            String firstName,
            String lastName,
            String email,
            Role role,
            UserStatus status,
            Instant createdAt
    ) {
        static AdminUserDto from(User u) {
            return new AdminUserDto(
                    u.getId().toString(), u.getDocumentId(), u.getFirstName(),
                    u.getLastName(), u.getEmail(), u.getRole(), u.getStatus(), u.getCreatedAt());
        }
    }

    public record MetricsDto(
            long totalUsers,
            long activeUsers,
            long blockedUsers,
            long totalAccounts,
            BigDecimal totalBalance,
            long transfersToday,
            BigDecimal volumeToday
    ) {
    }

    @GetMapping("/users")
    @Operation(summary = "Listar usuarios (paginado)")
    public Page<AdminUserDto> users(@RequestParam(defaultValue = "0") int page,
                                    @RequestParam(defaultValue = "20") int size) {
        int pageSize = Math.min(Math.max(size, 1), 100);
        return userRepository
                .findAll(PageRequest.of(page, pageSize, Sort.by(Sort.Direction.DESC, "createdAt")))
                .map(AdminUserDto::from);
    }

    @PatchMapping("/users/{id}/block")
    @Transactional
    @Operation(summary = "Bloquear un usuario",
            description = "Impide el login y revoca todas sus sesiones activas.")
    public AdminUserDto block(@PathVariable UUID id) {
        User user = getUser(id);
        if (user.getRole() == Role.ADMIN) {
            throw BusinessException.badRequest("No se puede bloquear a un administrador");
        }
        user.setStatus(UserStatus.BLOCKED);
        refreshTokenRepository.revokeAllByUser(user);
        return AdminUserDto.from(user);
    }

    @PatchMapping("/users/{id}/unblock")
    @Transactional
    @Operation(summary = "Desbloquear un usuario")
    public AdminUserDto unblock(@PathVariable UUID id) {
        User user = getUser(id);
        user.setStatus(UserStatus.ACTIVE);
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        return AdminUserDto.from(user);
    }

    @GetMapping("/metrics")
    @Operation(summary = "Métricas globales del sistema")
    public MetricsDto metrics() {
        Instant startOfDay = LocalDate.now(ZONE).atStartOfDay(ZONE).toInstant();
        return new MetricsDto(
                userRepository.count(),
                userRepository.countByStatus(UserStatus.ACTIVE),
                userRepository.countByStatus(UserStatus.BLOCKED),
                accountRepository.count(),
                accountRepository.totalActiveBalance(),
                transactionRepository.countByCreatedAtAfterAndType(startOfDay, TransactionType.TRANSFER_OUT),
                transactionRepository.sumVolumeSince(startOfDay)
        );
    }

    private User getUser(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("Usuario no encontrado"));
    }
}
