package com.redbanck.api.auth.dto;

import com.redbanck.api.user.UserDto;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public final class AuthDtos {

    private AuthDtos() {
    }

    public record RegisterRequest(
            @NotBlank(message = "El documento es obligatorio")
            @Size(min = 8, max = 20, message = "El documento debe tener entre 8 y 20 caracteres")
            @Pattern(regexp = "\\d+", message = "El documento solo admite dígitos")
            String documentId,

            @NotBlank(message = "El nombre es obligatorio")
            @Size(min = 2, max = 60)
            String firstName,

            @NotBlank(message = "El apellido es obligatorio")
            @Size(min = 2, max = 60)
            String lastName,

            @NotBlank(message = "El email es obligatorio")
            @Email(message = "Email inválido")
            String email,

            @NotBlank(message = "La contraseña es obligatoria")
            @Size(min = 6, max = 72, message = "La contraseña debe tener entre 6 y 72 caracteres")
            String password
    ) {
    }

    public record LoginRequest(
            @NotBlank(message = "El documento es obligatorio")
            String documentId,

            @NotBlank(message = "La contraseña es obligatoria")
            String password
    ) {
    }

    public record RefreshRequest(
            @NotBlank(message = "El refresh token es obligatorio")
            String refreshToken
    ) {
    }

    public record AuthResponse(
            String accessToken,
            String refreshToken,
            long expiresIn,
            UserDto user
    ) {
    }
}
