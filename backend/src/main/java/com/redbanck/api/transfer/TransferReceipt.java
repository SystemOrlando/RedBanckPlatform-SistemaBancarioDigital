package com.redbanck.api.transfer;

import java.math.BigDecimal;
import java.time.Instant;

public record TransferReceipt(
        String reference,
        BigDecimal amount,
        String sourceAccount,
        String destinationAccount,
        String destinationHolder,
        Instant createdAt
) {
}
