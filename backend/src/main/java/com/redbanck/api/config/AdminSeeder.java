package com.redbanck.api.config;

import com.redbanck.api.limits.LimitsService;
import com.redbanck.api.user.Role;
import com.redbanck.api.user.User;
import com.redbanck.api.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.support.TransactionTemplate;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class AdminSeeder {

    @Value("${app.seed.admin-document}")
    private String adminDocument;

    @Value("${app.seed.admin-email}")
    private String adminEmail;

    @Value("${app.seed.admin-password}")
    private String adminPassword;

    @Bean
    ApplicationRunner seedAdmin(UserRepository userRepository,
                                PasswordEncoder passwordEncoder,
                                LimitsService limitsService,
                                TransactionTemplate tx) {
        return args -> tx.executeWithoutResult(status -> {
            if (userRepository.existsByRole(Role.ADMIN)) {
                return;
            }
            User admin = userRepository.save(User.builder()
                    .documentId(adminDocument)
                    .firstName("Admin")
                    .lastName("RedBanck")
                    .email(adminEmail)
                    .passwordHash(passwordEncoder.encode(adminPassword))
                    .role(Role.ADMIN)
                    .build());
            limitsService.createDefaults(admin);
            log.info("Usuario administrador inicial creado: {}", adminEmail);
        });
    }
}
