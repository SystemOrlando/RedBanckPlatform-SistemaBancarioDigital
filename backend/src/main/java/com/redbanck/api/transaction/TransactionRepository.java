package com.redbanck.api.transaction;

import com.redbanck.api.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public interface TransactionRepository extends JpaRepository<Transaction, UUID>,
        JpaSpecificationExecutor<Transaction> {

    /** Total transferido (salidas) por el usuario desde un instante dado. */
    @Query("""
            select coalesce(sum(t.amount), 0) from Transaction t
            where t.account.user = :user
              and t.type = com.redbanck.api.transaction.TransactionType.TRANSFER_OUT
              and t.createdAt >= :since
            """)
    BigDecimal sumTransfersOutSince(@Param("user") User user, @Param("since") Instant since);

    long countByCreatedAtAfterAndType(Instant since, TransactionType type);

    @Query("""
            select coalesce(sum(t.amount), 0) from Transaction t
            where t.type = com.redbanck.api.transaction.TransactionType.TRANSFER_OUT
              and t.createdAt >= :since
            """)
    BigDecimal sumVolumeSince(@Param("since") Instant since);
}
