package com.redbanck.api.common;

import java.time.Instant;
import java.util.Map;

public record ApiError(
        Instant timestamp,
        int status,
        String message,
        Map<String, String> fieldErrors
) {
    public static ApiError of(int status, String message) {
        return new ApiError(Instant.now(), status, message, null);
    }

    public static ApiError validation(String message, Map<String, String> fieldErrors) {
        return new ApiError(Instant.now(), 400, message, fieldErrors);
    }
}
