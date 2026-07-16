package com.redbanck.api.transaction;

import com.redbanck.api.user.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.UUID;

@RestController
@RequestMapping("/transactions")
@RequiredArgsConstructor
@Tag(name = "Movimientos", description = "Historial de movimientos del usuario")
public class TransactionController {

    private static final ZoneId ZONE = ZoneId.of("America/Lima");

    private final TransactionRepository transactionRepository;

    public record TransactionDto(
            String id,
            String accountId,
            TransactionType type,
            BigDecimal amount,
            BigDecimal balanceAfter,
            String description,
            String counterpartyAccountNumber,
            String counterpartyName,
            String reference,
            Instant createdAt
    ) {
        static TransactionDto from(Transaction t) {
            return new TransactionDto(
                    t.getId().toString(),
                    t.getAccount().getId().toString(),
                    t.getType(),
                    t.getAmount(),
                    t.getBalanceAfter(),
                    t.getDescription(),
                    t.getCounterpartyAccountNumber(),
                    t.getCounterpartyName(),
                    t.getReference().toString(),
                    t.getCreatedAt()
            );
        }
    }

    @GetMapping
    @Operation(summary = "Historial paginado con filtros",
            description = "Filtra por cuenta, tipo de movimiento y rango de fechas (inclusive).")
    public Page<TransactionDto> search(@AuthenticationPrincipal User user,
                                       @RequestParam(required = false) UUID accountId,
                                       @RequestParam(required = false) TransactionType type,
                                       @RequestParam(required = false)
                                       @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                                       @RequestParam(required = false)
                                       @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
                                       @RequestParam(defaultValue = "0") int page,
                                       @RequestParam(defaultValue = "20") int size) {
        Instant fromInstant = from == null ? null : from.atStartOfDay(ZONE).toInstant();
        Instant toInstant = to == null ? null : to.plusDays(1).atStartOfDay(ZONE).toInstant();
        int pageSize = Math.min(Math.max(size, 1), 100);

        return transactionRepository
                .search(user, accountId, type, fromInstant, toInstant, PageRequest.of(page, pageSize))
                .map(TransactionDto::from);
    }
}
