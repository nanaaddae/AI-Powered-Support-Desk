package io.github.nanaaddae.ticket_support.dashboard.dto;

import lombok.Builder;
 
import java.util.UUID;
 
@Builder
public record AgentWorkload(
        UUID agentId,
        String agentName,
        long openTickets,
        long inProgressTickets,
        long totalAssigned
) {}
 