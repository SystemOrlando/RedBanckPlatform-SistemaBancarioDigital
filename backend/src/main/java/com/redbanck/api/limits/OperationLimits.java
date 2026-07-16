package com.redbanck.api.limits;

import com.redbanck.api.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

/** Límites de operación configurables por el usuario, acotados por topes del banco. */
@Entity
@Table(name = "operation_limits")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OperationLimits {

    public static final BigDecimal MAX_PER_TRANSFER_CAP = new BigDecimal("10000.00");
    public static final BigDecimal DAILY_CAP = new BigDecimal("30000.00");
    public static final BigDecimal MONTHLY_CAP = new BigDecimal("200000.00");

    public static final BigDecimal DEFAULT_PER_TRANSFER = new BigDecimal("5000.00");
    public static final BigDecimal DEFAULT_DAILY = new BigDecimal("10000.00");
    public static final BigDecimal DEFAULT_MONTHLY = new BigDecimal("50000.00");

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal maxPerTransfer;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal dailyTransferLimit;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal monthlyTransferLimit;
}
