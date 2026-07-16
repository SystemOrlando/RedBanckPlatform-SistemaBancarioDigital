package com.redbanck.api.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByDocumentId(String documentId);

    boolean existsByDocumentId(String documentId);

    boolean existsByEmail(String email);

    long countByStatus(UserStatus status);

    boolean existsByRole(Role role);
}
