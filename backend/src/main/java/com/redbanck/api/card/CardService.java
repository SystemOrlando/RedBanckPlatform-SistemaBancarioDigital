package com.redbanck.api.card;

import com.redbanck.api.account.Account;
import com.redbanck.api.account.AccountService;
import com.redbanck.api.common.BusinessException;
import com.redbanck.api.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CardService {

    /** Máximo de tarjetas activas por cuenta. */
    private static final int MAX_ACTIVE_CARDS_PER_ACCOUNT = 3;
    private static final String BIN = "455122"; // BIN ficticio de RedBanck
    private static final DateTimeFormatter EXP_FORMAT = DateTimeFormatter.ofPattern("MM/yyyy");

    private final VirtualCardRepository cardRepository;
    private final AccountService accountService;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom random = new SecureRandom();

    @Transactional(readOnly = true)
    public List<VirtualCard> listForUser(User user) {
        return cardRepository.findByUserOrderByCreatedAtDesc(user);
    }

    @Transactional
    public VirtualCard create(User user, UUID accountId) {
        Account account = accountService.getOwnedAccount(user, accountId);
        if (cardRepository.countByAccountAndStatus(account, CardStatus.ACTIVE) >= MAX_ACTIVE_CARDS_PER_ACCOUNT) {
            throw BusinessException.conflict(
                    "Alcanzaste el máximo de " + MAX_ACTIVE_CARDS_PER_ACCOUNT + " tarjetas activas para esta cuenta");
        }
        return cardRepository.save(VirtualCard.builder()
                .user(user)
                .account(account)
                .cardNumber(generateCardNumber())
                .cvv(String.format("%03d", random.nextInt(1000)))
                .expiration(YearMonth.now().plusYears(4).format(EXP_FORMAT))
                .build());
    }

    @Transactional
    public VirtualCard setStatus(User user, UUID cardId, CardStatus status) {
        VirtualCard card = getOwnedCard(user, cardId);
        card.setStatus(status);
        return card;
    }

    /** Revelar los datos completos exige confirmar la contraseña del usuario. */
    @Transactional(readOnly = true)
    public VirtualCard reveal(User user, UUID cardId, String password) {
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw BusinessException.unauthorized("Contraseña incorrecta");
        }
        return getOwnedCard(user, cardId);
    }

    private VirtualCard getOwnedCard(User user, UUID cardId) {
        VirtualCard card = cardRepository.findById(cardId)
                .orElseThrow(() -> BusinessException.notFound("Tarjeta no encontrada"));
        if (!card.getUser().getId().equals(user.getId())) {
            throw BusinessException.forbidden("La tarjeta no te pertenece");
        }
        return card;
    }

    /** Genera un PAN de 16 dígitos válido según Luhn con el BIN de RedBanck. */
    private String generateCardNumber() {
        String number;
        do {
            StringBuilder sb = new StringBuilder(BIN);
            for (int i = 0; i < 9; i++) {
                sb.append(random.nextInt(10));
            }
            sb.append(luhnCheckDigit(sb.toString()));
            number = sb.toString();
        } while (cardRepository.existsByCardNumber(number));
        return number;
    }

    private int luhnCheckDigit(String partial) {
        int sum = 0;
        boolean doubleIt = true;
        for (int i = partial.length() - 1; i >= 0; i--) {
            int digit = partial.charAt(i) - '0';
            if (doubleIt) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }
            sum += digit;
            doubleIt = !doubleIt;
        }
        return (10 - (sum % 10)) % 10;
    }
}
