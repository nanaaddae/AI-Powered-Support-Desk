package io.github.nanaaddae.ticket_support.tickets;

import io.github.nanaaddae.ticket_support.tickets.Ticket;
import io.github.nanaaddae.ticket_support.tickets.dto.TicketResponse;
import org.springframework.stereotype.Component;
 
@Component
public class TicketMapper {
 
    public TicketResponse toResponse(Ticket ticket) {
        return TicketResponse.builder()
                .id(ticket.getId())
                .title(ticket.getTitle())
                .description(ticket.getDescription())
                .status(ticket.getStatus())
                .priority(ticket.getPriority())
                .category(ticket.getCategory())
                .customerId(ticket.getCustomer().getId())
                .customerName(ticket.getCustomer().getFirstName() + " " + ticket.getCustomer().getLastName())
                .assignedAgentId(ticket.getAssignedAgent() != null ? ticket.getAssignedAgent().getId() : null)
                .assignedAgentName(ticket.getAssignedAgent() != null
                        ? ticket.getAssignedAgent().getFirstName() + " " + ticket.getAssignedAgent().getLastName()
                        : null)
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .build();
    }
}