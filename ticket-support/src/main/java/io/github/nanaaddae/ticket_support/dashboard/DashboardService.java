package io.github.nanaaddae.ticket_support.dashboard;

import io.github.nanaaddae.ticket_support.dashboard.dto.*;
import io.github.nanaaddae.ticket_support.exception.ResourceNotFoundException;
import io.github.nanaaddae.ticket_support.tickets.TicketRepository;
import io.github.nanaaddae.ticket_support.tickets.enums.TicketStatus;
import io.github.nanaaddae.ticket_support.tickets.TicketMapper;
import io.github.nanaaddae.ticket_support.user.User;
import io.github.nanaaddae.ticket_support.user.UserRepository;
import io.github.nanaaddae.ticket_support.user.enums.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
 
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
 
@Service
@RequiredArgsConstructor
public class DashboardService {
 
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final TicketMapper ticketMapper;
 
    public CustomerDashboardResponse getCustomerDashboard(String email) {
        User customer = getUser(email);
 
        var tickets = ticketRepository.findByCustomerOrderByCreatedAtDesc(customer);
 
        Map<String, Long> byStatus = groupByStatus(tickets.stream()
                .collect(Collectors.groupingBy(t -> t.getStatus().name(), Collectors.counting())));
 
        var recentTickets = tickets.stream()
                .limit(5)
                .map(ticketMapper::toResponse)
                .toList();
 
        return CustomerDashboardResponse.builder()
                .totalTickets(tickets.size())
                .ticketsByStatus(byStatus)
                .recentTickets(recentTickets)
                .build();
    }
 
    public AgentDashboardResponse getAgentDashboard(String email) {
        User agent = getUser(email);
 
        var tickets = ticketRepository.findByAssignedAgentOrderByCreatedAtDesc(agent);
 
        Map<String, Long> byStatus = groupByStatus(tickets.stream()
                .collect(Collectors.groupingBy(t -> t.getStatus().name(), Collectors.counting())));
 
        long needingAttention = tickets.stream()
                .filter(t -> t.getStatus() == TicketStatus.OPEN || t.getStatus() == TicketStatus.IN_PROGRESS)
                .count();
 
        var recentTickets = tickets.stream()
                .limit(5)
                .map(ticketMapper::toResponse)
                .toList();
 
        return AgentDashboardResponse.builder()
                .totalAssignedTickets(tickets.size())
                .ticketsNeedingAttention(needingAttention)
                .ticketsByStatus(byStatus)
                .recentTickets(recentTickets)
                .build();
    }
 
    public AdminDashboardResponse getAdminDashboard() {
        var allTickets = ticketRepository.findAllByOrderByCreatedAtDesc();
 
        Map<String, Long> byStatus = groupByStatus(allTickets.stream()
                .collect(Collectors.groupingBy(t -> t.getStatus().name(), Collectors.counting())));
 
        Map<String, Long> byPriority = allTickets.stream()
                .collect(Collectors.groupingBy(t -> t.getPriority().name(), Collectors.counting()));
 
        Map<String, Long> byCategory = allTickets.stream()
                .collect(Collectors.groupingBy(t -> t.getCategory().name(), Collectors.counting()));
 
        // Agent workloads
        List<AgentWorkload> agentWorkloads = userRepository.findByRole(Role.AGENT)
                .stream()
                .map(agent -> {
                    long open = ticketRepository.countByAssignedAgentAndStatus(agent, TicketStatus.OPEN);
                    long inProgress = ticketRepository.countByAssignedAgentAndStatus(agent, TicketStatus.IN_PROGRESS);
                    long total = ticketRepository.countByAssignedAgent(agent);
                    return AgentWorkload.builder()
                            .agentId(agent.getId())
                            .agentName(agent.getFirstName() + " " + agent.getLastName())
                            .openTickets(open)
                            .inProgressTickets(inProgress)
                            .totalAssigned(total)
                            .build();
                })
                .toList();
 
        var recentTickets = allTickets.stream()
                .limit(10)
                .map(ticketMapper::toResponse)
                .toList();
 
        return AdminDashboardResponse.builder()
                .totalTickets(allTickets.size())
                .ticketsByStatus(byStatus)
                .ticketsByPriority(byPriority)
                .ticketsByCategory(byCategory)
                .agentWorkloads(agentWorkloads)
                .recentTickets(recentTickets)
                .build();
    }
 
    // Ensures all statuses appear in the map even if count is 0
    private Map<String, Long> groupByStatus(Map<String, Long> counts) {
        return Arrays.stream(TicketStatus.values())
                .collect(Collectors.toMap(
                        Enum::name,
                        s -> counts.getOrDefault(s.name(), 0L)
                ));
    }
 
    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
}