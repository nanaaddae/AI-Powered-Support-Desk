package io.github.nanaaddae.ticket_support.user.dto;
import java.util.UUID;
import io.github.nanaaddae.ticket_support.user.enums.Role;


public record UserResponse(
        UUID id,
        String firstName,
        String lastName,
        String email,
        Role role
) {}