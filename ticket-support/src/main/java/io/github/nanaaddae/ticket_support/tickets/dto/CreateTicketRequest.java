package io.github.nanaaddae.ticket_support.tickets.dto;

import jakarta.validation.constraints.NotBlank;

import io.github.nanaaddae.ticket_support.tickets.enums.TicketCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
 
@Builder
public record CreateTicketRequest(
 
        @NotBlank(message = "Title is required")
        @Size(max = 255, message = "Title must be under 255 characters")
        String title,
 
        @NotBlank(message = "Description is required")
        @Size(max = 5000, message = "Description must be under 5000 characters")
        String description,
 
        @NotNull(message = "Category is required")
        TicketCategory category
) {}
 