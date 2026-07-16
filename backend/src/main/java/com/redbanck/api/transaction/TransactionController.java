package com.redbanck.api.transaction;

import com.redbanck.api.user.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
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

        // Filtros opcionales con Specification: evita parametros null en el SQL,
        // que PostgreSQL no puede tipar con el patron (:param is null or ...)
        Specification<Transaction> spec = (root, query, cb) -> {
            var predicates = new ArrayList<Predicate>();
            predicates.add(cb.equal(root.get("account").get("user"), user));
            if (accountId != null) predicates.add(cb.equal(root.get("account").get("id"), accountId));
            if (type != null) predicates.add(cb.equal(root.get("type"), type));
            if (fromInstant != null) predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), fromInstant));
            if (toInstant != null) predicates.add(cb.lessThan(root.get("createdAt"), toInstant));
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        var pageable = PageRequest.of(page, pageSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        return transactionRepository.findAll(spec, pageable).map(TransactionDto::from);
    }
}
