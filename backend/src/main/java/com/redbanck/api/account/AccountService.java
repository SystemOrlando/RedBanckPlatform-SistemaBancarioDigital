package com.redbanck.api.account;

import com.redbanck.api.common.BusinessException;
import com.redbanck.api.transaction.Transaction;
import com.redbanck.api.transaction.TransactionRepository;
import com.redbanck.api.transaction.TransactionType;
import com.redbanck.api.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AccountService {

    /** Máximo de cuentas activas por usuario. */
    private static final int MAX_ACTIVE_ACCOUNTS = 5;
    /** Bono de bienvenida acreditado al abrir la primera cuenta. */
    private static final BigDecimal WELCOME_BONUS = new BigDecimal("100.00");

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final SecureRandom random = new SecureRandom();

    @Transactional(readOnly = true)
    public List<AccountDto> listForUser(User user) {
        return accountRepository.findByUserOrderByCreatedAtAsc(user)
                .stream().map(AccountDto::from).toList();
    }

    @Transactional(readOnly = true)
    public Account getOwnedAccount(User user, UUID accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> BusinessException.notFound("Cuenta no encontrada"));
        if (!account.getUser().getId().equals(user.getId())) {
            throw BusinessException.forbidden("La cuenta no te pertenece");
        }
        return account;
    }

    @Transactional
    public AccountDto open(User user, String alias, AccountType type) {
        if (accountRepository.countByUserAndStatus(user, AccountStatus.ACTIVE) >= MAX_ACTIVE_ACCOUNTS) {
            throw BusinessException.conflict("Alcanzaste el máximo de " + MAX_ACTIVE_ACCOUNTS + " cuentas activas");
        }
        Account account = Account.builder()
                .accountNumber(generateAccountNumber())
                .alias(alias)
                .type(type)
                .user(user)
                .build();
        return AccountDto.from(accountRepository.save(account));
    }

    /** Cuenta inicial creada durante el registro, con bono de bienvenida. */
    @Transactional
    public Account openInitialAccount(User user) {
        Account account = Account.builder()
                .accountNumber(generateAccountNumber())
                .alias("Cuenta Principal")
                .type(AccountType.SAVINGS)
                .user(user)
                .balance(WELCOME_BONUS)
                .build();
        account = accountRepository.save(account);

        transactionRepository.save(Transaction.builder()
                .account(account)
                .type(TransactionType.DEPOSIT)
                .amount(WELCOME_BONUS)
                .balanceAfter(WELCOME_BONUS)
                .description("Bono de bienvenida RedBanck")
                .reference(UUID.randomUUID())
                .build());
        return account;
    }

    private String generateAccountNumber() {
        String number;
        do {
            StringBuilder sb = new StringBuilder("12"); // prefijo de entidad
            for (int i = 0; i < 12; i++) {
                sb.append(random.nextInt(10));
            }
            number = sb.toString();
        } while (accountRepository.existsByAccountNumber(number));
        return number;
    }
}
