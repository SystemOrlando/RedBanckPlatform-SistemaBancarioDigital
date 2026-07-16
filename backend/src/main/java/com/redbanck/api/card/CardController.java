package com.redbanck.api.card;

import com.redbanck.api.user.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/cards")
@RequiredArgsConstructor
@Tag(name = "Tarjetas", description = "Tarjetas virtuales del usuario")
public class CardController {

    private final CardService cardService;

    /** Vista enmascarada: nunca expone el PAN ni el CVV completos. */
    public record CardDto(
            String id,
            String accountId,
            String maskedNumber,
            String expiration,
            CardStatus status,
            boolean expired,
            Instant createdAt
    ) {
        static CardDto from(VirtualCard c) {
            return new CardDto(
                    c.getId().toString(),
                    c.getAccount().getId().toString(),
                    c.maskedNumber(),
                    c.getExpiration(),
                    c.getStatus(),
                    c.isExpired(),
                    c.getCreatedAt()
            );
        }
    }

    public record RevealedCardDto(String id, String cardNumber, String cvv, String expiration) {
    }

    public record CreateCardRequest(
            @NotNull(message = "La cuenta es obligatoria") UUID accountId
    ) {
    }

    public record RevealRequest(
            @NotBlank(message = "La contraseña es obligatoria") String password
    ) {
    }

    @GetMapping
    @Operation(summary = "Listar tarjetas (datos enmascarados)")
    public List<CardDto> list(@AuthenticationPrincipal User user) {
        return cardService.listForUser(user).stream().map(CardDto::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Generar una nueva tarjeta virtual")
    public CardDto create(@AuthenticationPrincipal User user,
                          @Valid @RequestBody CreateCardRequest request) {
        return CardDto.from(cardService.create(user, request.accountId()));
    }

    @PatchMapping("/{id}/block")
    @Operation(summary = "Bloquear una tarjeta")
    public CardDto block(@AuthenticationPrincipal User user, @PathVariable UUID id) {
        return CardDto.from(cardService.setStatus(user, id, CardStatus.BLOCKED));
    }

    @PatchMapping("/{id}/unblock")
    @Operation(summary = "Desbloquear una tarjeta")
    public CardDto unblock(@AuthenticationPrincipal User user, @PathVariable UUID id) {
        return CardDto.from(cardService.setStatus(user, id, CardStatus.ACTIVE));
    }

    @PostMapping("/{id}/reveal")
    @Operation(summary = "Revelar número completo y CVV",
            description = "Requiere confirmar la contraseña del usuario.")
    public RevealedCardDto reveal(@AuthenticationPrincipal User user,
                                  @PathVariable UUID id,
                                  @Valid @RequestBody RevealRequest request) {
        VirtualCard card = cardService.reveal(user, id, request.password());
        return new RevealedCardDto(
                card.getId().toString(),
                card.getCardNumber(),
                card.getCvv(),
                card.getExpiration());
    }
}
