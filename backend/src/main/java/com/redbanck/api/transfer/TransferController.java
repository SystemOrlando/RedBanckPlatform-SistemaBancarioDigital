package com.redbanck.api.transfer;

import com.redbanck.api.user.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/transfers")
@RequiredArgsConstructor
@Tag(name = "Transferencias", description = "Transferencias entre cuentas RedBanck")
public class TransferController {

    private final TransferService transferService;

    public record TransferRequest(
            @NotNull(message = "La cuenta de origen es obligatoria")
            UUID sourceAccountId,

            @NotBlank(message = "La cuenta de destino es obligatoria")
            @Pattern(regexp = "\\d{14}", message = "El número de cuenta debe tener 14 dígitos")
            String destinationAccountNumber,

            @NotNull(message = "El monto es obligatorio")
            @DecimalMin(value = "0.01", message = "El monto mínimo es S/ 0.01")
            @Digits(integer = 17, fraction = 2, message = "Máximo 2 decimales")
            BigDecimal amount,

            @Size(max = 140, message = "La descripción admite hasta 140 caracteres")
            String description
    ) {
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Realizar una transferencia",
            description = "Valida saldo y límites (por operación, diario y mensual) y registra el movimiento en ambas cuentas.")
    public TransferReceipt transfer(@AuthenticationPrincipal User user,
                                    @Valid @RequestBody TransferRequest request) {
        return transferService.transfer(
                user,
                request.sourceAccountId(),
                request.destinationAccountNumber(),
                request.amount(),
                request.description());
    }
}
