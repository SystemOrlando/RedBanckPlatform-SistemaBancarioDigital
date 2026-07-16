package com.redbanck.api.transaction;

import com.redbanck.api.account.Account;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Movimiento sobre una cuenta. Una transferencia genera dos filas
 * (TRANSFER_OUT en origen y TRANSFER_IN en destino) unidas por {@code reference}.
 */
@Entity
@Table(name = "transactions", indexes = {
        @Index(name = "idx_tx_account_date", columnList = "account_id, createdAt")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "account_id")
    private Account account;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private TransactionType type;

    /** Siempre positivo; el signo lo determina el tipo. */
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal balanceAfter;

    @Column(length = 140)
    private String description;

    @Column(length = 14)
    private String counterpartyAccountNumber;

    @Column(length = 120)
    private String counterpartyName;

    /** Correlaciona las dos patas de una transferencia. */
    @Column(nullable = false)
    private UUID reference;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
