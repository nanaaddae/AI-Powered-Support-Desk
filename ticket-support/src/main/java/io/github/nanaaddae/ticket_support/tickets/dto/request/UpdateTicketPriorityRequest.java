package io.github.nanaaddae.ticket_support.tickets.dto.request;

import io.github.nanaaddae.ticket_support.tickets.enums.TicketPriority;
import jakarta.validation.constraints.NotNull;

 
public record UpdateTicketPriorityRequest(
        @NotNull(message = "Priority is required")
        TicketPriority priority
) {}
 
