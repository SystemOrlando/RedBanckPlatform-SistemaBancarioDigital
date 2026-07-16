package com.redbanck.api.card;

import com.redbanck.api.account.Account;
import com.redbanck.api.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface VirtualCardRepository extends JpaRepository<VirtualCard, UUID> {

    List<VirtualCard> findByUserOrderByCreatedAtDesc(User user);

    long countByAccountAndStatus(Account account, CardStatus status);

    boolean existsByCardNumber(String cardNumber);
}
