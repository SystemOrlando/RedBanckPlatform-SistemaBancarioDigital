package com.redbanck.api.card;

import com.redbanck.api.account.Account;
import com.redbanck.api.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.YearMonth;
import java.util.UUID;

@Entity
@Table(name = "virtual_cards", indexes = @Index(name = "idx_cards_number", columnList = "cardNumber", unique = true))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VirtualCard {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "account_id")
    private Account account;

    @Column(nullable = false, unique = true, length = 16)
    private String cardNumber;

    @Column(nullable = false, length = 3)
    private String cvv;

    @Column(nullable = false, length = 7)
    private String expiration; // formato MM/yyyy

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private CardStatus status = CardStatus.ACTIVE;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    public String maskedNumber() {
        return "**** **** **** " + cardNumber.substring(12);
    }

    public boolean isExpired() {
        String[] parts = expiration.split("/");
        YearMonth exp = YearMonth.of(Integer.parseInt(parts[1]), Integer.parseInt(parts[0]));
        return YearMonth.now().isAfter(exp);
    }
}
