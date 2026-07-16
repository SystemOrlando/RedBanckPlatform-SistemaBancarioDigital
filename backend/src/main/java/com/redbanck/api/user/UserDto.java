package com.redbanck.api.user;

/** Representación pública del usuario. Coincide con el tipo User del frontend. */
public record UserDto(
        String id,
        String email,
        String firstName,
        String lastName,
        Role role
) {
    public static UserDto from(User user) {
        return new UserDto(
                user.getId().toString(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole()
        );
    }
}
