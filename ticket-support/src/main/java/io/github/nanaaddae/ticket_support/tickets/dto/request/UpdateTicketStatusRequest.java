package io.github.nanaaddae.ticket_support.tickets.dto.request;

import io.github.nanaaddae.ticket_support.tickets.enums.TicketStatus;
import jakarta.validation.constraints.NotNull;
 
public record UpdateTicketStatusRequest(
        @NotNull(message = "Status is required")
        TicketStatus status
) {}
