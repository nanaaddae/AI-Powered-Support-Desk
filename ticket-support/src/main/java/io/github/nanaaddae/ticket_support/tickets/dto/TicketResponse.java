package io.github.nanaaddae.ticket_support.tickets.dto;


import java.time.Instant;
import java.util.UUID;
import lombok.Builder;

 
import io.github.nanaaddae.ticket_support.tickets.enums.TicketCategory;
import io.github.nanaaddae.ticket_support.tickets.enums.TicketPriority;
import io.github.nanaaddae.ticket_support.tickets.enums.TicketStatus;


@Builder
public record TicketResponse(
        UUID id,
        String title,
        String description,
        TicketStatus status,
        TicketPriority priority,
        TicketCategory category,
        UUID customerId,
        String customerName,
        UUID assignedAgentId,
        String assignedAgentName,
        Instant createdAt,
        Instant updatedAt
) {}
 