package io.github.nanaaddae.ticket_support.auth.dto;

import io.github.nanaaddae.ticket_support.user.enums.Role;
import lombok.Builder;
 
import java.util.UUID;
 
@Builder
public record RegisterResponse(
        UUID id,
        String firstName,
        String lastName,
        String email,
        Role role
) {}
 