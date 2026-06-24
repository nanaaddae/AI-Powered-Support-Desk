package io.github.nanaaddae.ticket_support.ai.dto;

import io.github.nanaaddae.ticket_support.tickets.enums.TicketCategory;
import io.github.nanaaddae.ticket_support.tickets.enums.TicketPriority;
import lombok.Builder;
 
@Builder
public record ClassificationResult(
        TicketCategory category,
        TicketPriority priority,
        String reasoning
) {}
 