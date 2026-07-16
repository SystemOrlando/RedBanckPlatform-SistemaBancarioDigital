package com.redbanck.api.account;

import com.redbanck.api.user.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AccountRepository extends JpaRepository<Account, UUID> {

    List<Account> findByUserOrderByCreatedAtAsc(User user);

    Optional<Account> findByAccountNumber(String accountNumber);

    boolean existsByAccountNumber(String accountNumber);

    long countByUserAndStatus(User user, AccountStatus status);

    /** Lectura con bloqueo pesimista para operaciones que mueven saldo. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select a from Account a where a.id = :id")
    Optional<Account> findByIdForUpdate(@Param("id") UUID id);

    @Query("select coalesce(sum(a.balance), 0) from Account a where a.status = 'ACTIVE'")
    BigDecimal totalActiveBalance();
}
