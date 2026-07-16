package com.redbanck.api.limits;

import com.redbanck.api.user.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/limits")
@RequiredArgsConstructor
@Tag(name = "Límites", description = "Límites de operación del usuario")
public class LimitsController {

    private final LimitsService limitsService;

    public record LimitsDto(
            BigDecimal maxPerTransfer,
            BigDecimal dailyTransferLimit,
            BigDecimal monthlyTransferLimit,
            BigDecimal maxPerTransferCap,
            BigDecimal dailyCap,
            BigDecimal monthlyCap
    ) {
        static LimitsDto from(OperationLimits l) {
            return new LimitsDto(
                    l.getMaxPerTransfer(),
                    l.getDailyTransferLimit(),
                    l.getMonthlyTransferLimit(),
                    OperationLimits.MAX_PER_TRANSFER_CAP,
                    OperationLimits.DAILY_CAP,
                    OperationLimits.MONTHLY_CAP
            );
        }
    }

    public record UpdateLimitsRequest(
            @NotNull @Digits(integer = 17, fraction = 2) BigDecimal maxPerTransfer,
            @NotNull @Digits(integer = 17, fraction = 2) BigDecimal dailyTransferLimit,
            @NotNull @Digits(integer = 17, fraction = 2) BigDecimal monthlyTransferLimit
    ) {
    }

    @GetMapping
    @Operation(summary = "Consultar los límites vigentes y los topes del banco")
    public LimitsDto get(@AuthenticationPrincipal User user) {
        return LimitsDto.from(limitsService.getForUser(user));
    }

    @PutMapping
    @Operation(summary = "Actualizar los límites de operación")
    public LimitsDto update(@AuthenticationPrincipal User user,
                            @Valid @RequestBody UpdateLimitsRequest request) {
        return LimitsDto.from(limitsService.update(
                user,
                request.maxPerTransfer(),
                request.dailyTransferLimit(),
                request.monthlyTransferLimit()));
    }
}
