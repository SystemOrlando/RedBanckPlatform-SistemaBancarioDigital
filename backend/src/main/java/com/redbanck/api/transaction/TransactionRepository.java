package com.redbanck.api.transaction;

import com.redbanck.api.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    @Query("""
            select t from Transaction t
            where t.account.user = :user
              and (:accountId is null or t.account.id = :accountId)
              and (:type is null or t.type = :type)
              and (:from is null or t.createdAt >= :from)
              and (:to is null or t.createdAt < :to)
            order by t.createdAt desc
            """)
    Page<Transaction> search(@Param("user") User user,
                             @Param("accountId") UUID accountId,
                             @Param("type") TransactionType type,
                             @Param("from") Instant from,
                             @Param("to") Instant to,
                             Pageable pageable);

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
