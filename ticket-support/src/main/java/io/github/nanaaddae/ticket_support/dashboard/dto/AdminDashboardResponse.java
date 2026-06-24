package io.github.nanaaddae.ticket_support.dashboard.dto;

import io.github.nanaaddae.ticket_support.tickets.dto.TicketResponse;
import lombok.Builder;
 
import java.util.List;
import java.util.Map;
 
@Builder
public record AdminDashboardResponse(
        long totalTickets,
        Map<String, Long> ticketsByStatus,
        Map<String, Long> ticketsByPriority,
        Map<String, Long> ticketsByCategory,
        List<AgentWorkload> agentWorkloads,
        List<TicketResponse> recentTickets
) {}
 