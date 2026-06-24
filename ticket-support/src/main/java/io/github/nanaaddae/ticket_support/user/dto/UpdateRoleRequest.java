package io.github.nanaaddae.ticket_support.user.dto;

import io.github.nanaaddae.ticket_support.user.enums.Role;
import jakarta.validation.constraints.NotNull;
 
public record UpdateRoleRequest(
        @NotNull(message = "Role is required")
        Role role
) {}
 