package com.redbanck.api.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.security")
public record SecurityProperties(
        String jwtSecret,
        int accessTokenMinutes,
        int refreshTokenDays,
        int maxFailedAttempts,
        int lockMinutes
) {
}
