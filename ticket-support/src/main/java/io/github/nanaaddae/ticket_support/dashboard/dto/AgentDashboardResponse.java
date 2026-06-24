package io.github.nanaaddae.ticket_support.dashboard.dto;

import io.github.nanaaddae.ticket_support.tickets.dto.TicketResponse;
import lombok.Builder;
 
import java.util.List;
import java.util.Map;
 
@Builder
public record AgentDashboardResponse(
        long totalAssignedTickets,
        long ticketsNeedingAttention,
        Map<String, Long> ticketsByStatus,
        List<TicketResponse> recentTickets
) {}
 
