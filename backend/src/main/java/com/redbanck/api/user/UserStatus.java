package com.redbanck.api.user;

public enum UserStatus {
    /** Puede operar con normalidad. */
    ACTIVE,
    /** Bloqueado por un administrador; no puede iniciar sesión ni operar. */
    BLOCKED
}
