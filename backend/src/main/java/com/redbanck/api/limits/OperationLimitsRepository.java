package com.redbanck.api.limits;

import com.redbanck.api.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface OperationLimitsRepository extends JpaRepository<OperationLimits, UUID> {

    Optional<OperationLimits> findByUser(User user);
}
