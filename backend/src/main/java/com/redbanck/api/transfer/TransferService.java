package com.redbanck.api.transfer;

import com.redbanck.api.account.Account;
import com.redbanck.api.account.AccountRepository;
import com.redbanck.api.account.AccountStatus;
import com.redbanck.api.common.BusinessException;
import com.redbanck.api.limits.LimitsService;
import com.redbanck.api.limits.OperationLimits;
import com.redbanck.api.transaction.Transaction;
import com.redbanck.api.transaction.TransactionRepository;
import com.redbanck.api.transaction.TransactionType;
import com.redbanck.api.user.User;
import com.redbanck.api.user.UserStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TransferService {

    private static final ZoneId ZONE = ZoneId.of("America/Lima");

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final LimitsService limitsService;

    /**
     * Transferencia atómica entre cuentas. Bloquea ambas cuentas en orden
     * determinista (por id) para evitar interbloqueos entre transferencias cruzadas.
     */
    @Transactional
    public TransferReceipt transfer(User user, UUID sourceAccountId,
                                    String destinationAccountNumber,
                                    BigDecimal amount, String description) {
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw BusinessException.forbidden("Tu usuario no puede operar");
        }
        if (amount == null || amount.signum() <= 0 || amount.scale() > 2) {
            throw BusinessException.badRequest("El monto debe ser positivo con máximo 2 decimales");
        }

        Account sourceRef = accountRepository.findById(sourceAccountId)
                .orElseThrow(() -> BusinessException.notFound("Cuenta de origen no encontrada"));
        if (!sourceRef.getUser().getId().equals(user.getId())) {
            throw BusinessException.forbidden("La cuenta de origen no te pertenece");
        }
        Account destinationRef = accountRepository.findByAccountNumber(destinationAccountNumber)
                .orElseThrow(() -> BusinessException.notFound("La cuenta de destino no existe"));
        if (sourceRef.getId().equals(destinationRef.getId())) {
            throw BusinessException.badRequest("No puedes transferir a la misma cuenta");
        }

        // Bloqueo pesimista en orden determinista
        Account first, second;
        boolean sourceFirst = sourceRef.getId().compareTo(destinationRef.getId()) < 0;
        first = lock(sourceFirst ? sourceRef.getId() : destinationRef.getId());
        second = lock(sourceFirst ? destinationRef.getId() : sourceRef.getId());
        Account source = sourceFirst ? first : second;
        Account destination = sourceFirst ? second : first;

        if (source.getStatus() != AccountStatus.ACTIVE) {
            throw BusinessException.badRequest("La cuenta de origen no está activa");
        }
        if (destination.getStatus() != AccountStatus.ACTIVE) {
            throw BusinessException.badRequest("La cuenta de destino no está activa");
        }
        if (destination.getUser().getStatus() != UserStatus.ACTIVE) {
            throw BusinessException.badRequest("El destinatario no puede recibir transferencias");
        }
        if (source.getBalance().compareTo(amount) < 0) {
            throw BusinessException.badRequest("Saldo insuficiente");
        }

        enforceLimits(user, amount);

        source.setBalance(source.getBalance().subtract(amount));
        destination.setBalance(destination.getBalance().add(amount));

        UUID reference = UUID.randomUUID();
        String cleanDescription = description == null || description.isBlank()
                ? "Transferencia" : description.trim();

        Transaction outgoing = transactionRepository.save(Transaction.builder()
                .account(source)
                .type(TransactionType.TRANSFER_OUT)
                .amount(amount)
                .balanceAfter(source.getBalance())
                .description(cleanDescription)
                .counterpartyAccountNumber(destination.getAccountNumber())
                .counterpartyName(destination.getUser().fullName())
                .reference(reference)
                .build());

        transactionRepository.save(Transaction.builder()
                .account(destination)
                .type(TransactionType.TRANSFER_IN)
                .amount(amount)
                .balanceAfter(destination.getBalance())
                .description(cleanDescription)
                .counterpartyAccountNumber(source.getAccountNumber())
                .counterpartyName(source.getUser().fullName())
                .reference(reference)
                .build());

        return new TransferReceipt(
                reference.toString(),
                amount,
                source.maskedNumber(),
                destination.maskedNumber(),
                destination.getUser().fullName(),
                outgoing.getCreatedAt()
        );
    }

    private void enforceLimits(User user, BigDecimal amount) {
        OperationLimits limits = limitsService.getForUser(user);

        if (amount.compareTo(limits.getMaxPerTransfer()) > 0) {
            throw BusinessException.badRequest(
                    "El monto supera tu límite por transferencia (S/ " + limits.getMaxPerTransfer() + ")");
        }

        var startOfDay = LocalDate.now(ZONE).atStartOfDay(ZONE).toInstant();
        BigDecimal todayTotal = transactionRepository.sumTransfersOutSince(user, startOfDay);
        if (todayTotal.add(amount).compareTo(limits.getDailyTransferLimit()) > 0) {
            throw BusinessException.badRequest(
                    "Superarías tu límite diario de transferencias (S/ " + limits.getDailyTransferLimit() + ")");
        }

        var startOfMonth = LocalDate.now(ZONE).withDayOfMonth(1).atStartOfDay(ZONE).toInstant();
        BigDecimal monthTotal = transactionRepository.sumTransfersOutSince(user, startOfMonth);
        if (monthTotal.add(amount).compareTo(limits.getMonthlyTransferLimit()) > 0) {
            throw BusinessException.badRequest(
                    "Superarías tu límite mensual de transferencias (S/ " + limits.getMonthlyTransferLimit() + ")");
        }
    }

    private Account lock(UUID accountId) {
        return accountRepository.findByIdForUpdate(accountId)
                .orElseThrow(() -> BusinessException.notFound("Cuenta no encontrada"));
    }
}
