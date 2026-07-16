package com.redbanck.api.account;

import java.math.BigDecimal;
import java.time.Instant;

public record AccountDto(
        String id,
        String accountNumber,
        String maskedNumber,
        String alias,
        AccountType type,
        String currency,
        BigDecimal balance,
        AccountStatus status,
        Instant createdAt
) {
    public static AccountDto from(Account a) {
        return new AccountDto(
                a.getId().toString(),
                a.getAccountNumber(),
                a.maskedNumber(),
                a.getAlias(),
                a.getType(),
                a.getCurrency(),
                a.getBalance(),
                a.getStatus(),
                a.getCreatedAt()
        );
    }
}
