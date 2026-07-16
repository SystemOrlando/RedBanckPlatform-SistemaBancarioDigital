package com.redbanck.api.limits;

import com.redbanck.api.common.BusinessException;
import com.redbanck.api.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class LimitsService {

    private final OperationLimitsRepository repository;

    @Transactional
    public OperationLimits createDefaults(User user) {
        return repository.save(OperationLimits.builder()
                .user(user)
                .maxPerTransfer(OperationLimits.DEFAULT_PER_TRANSFER)
                .dailyTransferLimit(OperationLimits.DEFAULT_DAILY)
                .monthlyTransferLimit(OperationLimits.DEFAULT_MONTHLY)
                .build());
    }

    @Transactional(readOnly = true)
    public OperationLimits getForUser(User user) {
        return repository.findByUser(user)
                .orElseThrow(() -> BusinessException.notFound("Límites no configurados"));
    }

    @Transactional
    public OperationLimits update(User user, BigDecimal maxPerTransfer,
                                  BigDecimal daily, BigDecimal monthly) {
        validateRange("por transferencia", maxPerTransfer, OperationLimits.MAX_PER_TRANSFER_CAP);
        validateRange("diario", daily, OperationLimits.DAILY_CAP);
        validateRange("mensual", monthly, OperationLimits.MONTHLY_CAP);

        if (maxPerTransfer.compareTo(daily) > 0) {
            throw BusinessException.badRequest("El límite por transferencia no puede superar el límite diario");
        }
        if (daily.compareTo(monthly) > 0) {
            throw BusinessException.badRequest("El límite diario no puede superar el límite mensual");
        }

        OperationLimits limits = getForUser(user);
        limits.setMaxPerTransfer(maxPerTransfer);
        limits.setDailyTransferLimit(daily);
        limits.setMonthlyTransferLimit(monthly);
        return limits;
    }

    private void validateRange(String label, BigDecimal value, BigDecimal cap) {
        if (value == null || value.compareTo(BigDecimal.ONE) < 0) {
            throw BusinessException.badRequest("El límite " + label + " debe ser mayor o igual a S/ 1.00");
        }
        if (value.compareTo(cap) > 0) {
            throw BusinessException.badRequest("El límite " + label + " no puede superar S/ " + cap);
        }
    }
}
