package com.redbanck.api.account;

import com.redbanck.api.user.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/accounts")
@RequiredArgsConstructor
@Tag(name = "Cuentas", description = "Gestión de cuentas bancarias del usuario")
public class AccountController {

    private final AccountService accountService;

    public record OpenAccountRequest(
            @NotBlank(message = "El alias es obligatorio")
            @Size(min = 3, max = 60)
            String alias,
            @NotNull(message = "El tipo de cuenta es obligatorio")
            AccountType type
    ) {
    }

    @GetMapping
    @Operation(summary = "Listar las cuentas del usuario autenticado")
    public List<AccountDto> list(@AuthenticationPrincipal User user) {
        return accountService.listForUser(user);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detalle de una cuenta propia")
    public AccountDto detail(@AuthenticationPrincipal User user, @PathVariable UUID id) {
        return AccountDto.from(accountService.getOwnedAccount(user, id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Abrir una nueva cuenta")
    public AccountDto open(@AuthenticationPrincipal User user,
                           @Valid @RequestBody OpenAccountRequest request) {
        return accountService.open(user, request.alias(), request.type());
    }
}
