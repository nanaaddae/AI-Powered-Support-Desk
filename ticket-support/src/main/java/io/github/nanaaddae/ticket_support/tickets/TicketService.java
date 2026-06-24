package io.github.nanaaddae.ticket_support.tickets;

import io.github.nanaaddae.ticket_support.tickets.dto.CreateTicketRequest;
import io.github.nanaaddae.ticket_support.tickets.dto.TicketResponse;
import io.github.nanaaddae.ticket_support.tickets.dto.request.AssignTicketRequest;
import io.github.nanaaddae.ticket_support.tickets.dto.request.UpdateTicketPriorityRequest;
import io.github.nanaaddae.ticket_support.tickets.dto.request.UpdateTicketStatusRequest;
import io.github.nanaaddae.ticket_support.tickets.enums.TicketCategory;
import io.github.nanaaddae.ticket_support.tickets.enums.TicketPriority;
import io.github.nanaaddae.ticket_support.tickets.enums.TicketStatus;
import io.github.nanaaddae.ticket_support.audit.AuditService;
import io.github.nanaaddae.ticket_support.audit.enums.AuditAction;
import io.github.nanaaddae.ticket_support.exception.ForbiddenException;
import io.github.nanaaddae.ticket_support.exception.ResourceNotFoundException;
import io.github.nanaaddae.ticket_support.tickets.TicketMapper;
import io.github.nanaaddae.ticket_support.user.User;
import io.github.nanaaddae.ticket_support.user.UserRepository;
import io.github.nanaaddae.ticket_support.user.enums.Role;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import io.github.nanaaddae.ticket_support.ai.AiService;
 
import java.util.List;
import java.util.UUID;
 
@Service
@Slf4j 
@RequiredArgsConstructor
public class TicketService {
 
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final TicketMapper ticketMapper;
 
    private final AuditService auditService;
    private final AiService aiService;
    




    public TicketResponse createTicket(CreateTicketRequest request, String customerEmail) {
    User customer = userRepository.findByEmail(customerEmail)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

    Ticket ticket = Ticket.builder()
            .title(request.title())
            .description(request.description())
            .category(request.category())
            .customer(customer)
            .build();

    Ticket saved = ticketRepository.save(ticket);

    try {
        aiService.classifyTicket(saved.getId(), customer.getEmail());
     log.info("AI classification completed for ticket {}", saved.getId());

    } catch (Exception e) {
        log.warn("AI classification failed for ticket {}: {}", saved.getId(), e.getMessage());
    }

    return ticketMapper.toResponse(ticketRepository.findById(saved.getId()).orElse(saved));
}
 
    public List<TicketResponse> getMyTickets(String customerEmail) {
        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
 
        return ticketRepository.findByCustomer(customer)
                .stream()
                .map(ticketMapper::toResponse)
                .toList();
    }
 
    public TicketResponse getTicketById(UUID ticketId, String requesterEmail) {
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
 
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", ticketId.toString()));
 
        // Customers can only view their own tickets
        boolean isCustomer = requester.getRole().name().equals("CUSTOMER");
        if (isCustomer && !ticket.getCustomer().getId().equals(requester.getId())) {
            throw new RuntimeException("Access denied");
        }
 
        return ticketMapper.toResponse(ticket);
    }

    public TicketResponse assignTicket(UUID ticketId, AssignTicketRequest request, String requesterEmail) {
    User requester = getUser(requesterEmail);
    Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new ResourceNotFoundException("Ticket", ticketId.toString()));
 
    Role role = requester.getRole();
 
    if (role == Role.AGENT) {
        // Agents can only self-assign unassigned tickets
        if (ticket.getAssignedAgent() != null) {
            throw new ForbiddenException("Ticket is already assigned");
        }
        if (!request.agentId().equals(requester.getId())) {
            throw new ForbiddenException("Agents can only assign tickets to themselves");
        }
    } else if (role == Role.TEAM_LEAD || role == Role.ADMIN) {
        // Team leads and admins can assign to anyone
        if (request.agentId() == null) {
            throw new IllegalArgumentException("Agent ID is required");
        }
    } else {
        throw new ForbiddenException("You do not have permission to assign tickets");
    }
 
    User agent = userRepository.findById(request.agentId())
            .orElseThrow(() -> new ResourceNotFoundException("User", request.agentId().toString()));
 
    if (agent.getRole() != Role.AGENT && agent.getRole() != Role.TEAM_LEAD) {
        throw new IllegalArgumentException("Target user is not an agent");
    }
 
    ticket.setAssignedAgent(agent);
    ticket.setStatus(TicketStatus.IN_PROGRESS);
    Ticket saved = ticketRepository.save(ticket);
 
    auditService.log(requester, AuditAction.TICKET_ASSIGNED, "TICKET", ticketId.toString(),
            "Assigned to " + agent.getFirstName() + " " + agent.getLastName());
 
    return ticketMapper.toResponse(saved);
}
 
// Also add this private helper if not already present:
private User getUser(String email) {
    return userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
}

public List<TicketResponse> getAssignedTickets(String agentEmail) {
    User agent = getUser(agentEmail);
    return ticketRepository.findByAssignedAgentOrderByCreatedAtDesc(agent)
            .stream()
            .map(ticketMapper::toResponse)
            .toList();
}

public TicketResponse updateStatus(UUID ticketId, UpdateTicketStatusRequest request, String requesterEmail) {
    User requester = getUser(requesterEmail);
    Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new ResourceNotFoundException("Ticket", ticketId.toString()));
 
    Role role = requester.getRole();
 
    // Agents can only update status on their assigned tickets
    if (role == Role.AGENT) {
        if (ticket.getAssignedAgent() == null ||
                !ticket.getAssignedAgent().getId().equals(requester.getId())) {
            throw new ForbiddenException("You can only update status on tickets assigned to you");
        }
    } else if (role == Role.CUSTOMER) {
        throw new ForbiddenException("Customers cannot update ticket status");
    }
 
    TicketStatus previousStatus = ticket.getStatus();
    ticket.setStatus(request.status());
    Ticket saved = ticketRepository.save(ticket);
 
    auditService.log(requester, AuditAction.TICKET_STATUS_CHANGED, "TICKET", ticketId.toString(),
            "Status changed from " + previousStatus + " to " + request.status());
 
    return ticketMapper.toResponse(saved);
}


public Page<TicketResponse> getAllTickets(Pageable pageable) {
    return ticketRepository.findAll(pageable)
            .map(ticketMapper::toResponse);
}
 


public TicketResponse updatePriority(UUID ticketId, UpdateTicketPriorityRequest request, String requesterEmail) {
    User requester = getUser(requesterEmail);
    Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new ResourceNotFoundException("Ticket", ticketId.toString()));
 
    Role role = requester.getRole();
    if (role == Role.CUSTOMER || role == Role.AGENT) {
        throw new ForbiddenException("You do not have permission to change ticket priority");
    }
 
    TicketPriority previous = ticket.getPriority();
    ticket.setPriority(request.priority());
    Ticket saved = ticketRepository.save(ticket);
 
    auditService.log(requester, AuditAction.TICKET_PRIORITY_CHANGED, "TICKET", ticketId.toString(),
            "Priority changed from " + previous + " to " + request.priority());
 
    return ticketMapper.toResponse(saved);
}


  public Page<TicketResponse> getAllTickets(
            int page, 
            int size, 
            String status, 
            String priority, 
            String category, 
            String search,
            String sortBy,
            String sortDir
    ) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        // Convert string parameters to enums (handle null/empty)
        TicketStatus statusEnum = null;
        TicketPriority priorityEnum = null;
        TicketCategory categoryEnum = null;
        
        if (status != null && !status.isEmpty()) {
            try {
                statusEnum = TicketStatus.valueOf(status);
            } catch (IllegalArgumentException e) {
                // Invalid status - ignore filter
            }
        }
        
        if (priority != null && !priority.isEmpty()) {
            try {
                priorityEnum = TicketPriority.valueOf(priority);
            } catch (IllegalArgumentException e) {
                // Invalid priority - ignore filter
            }
        }
        
        if (category != null && !category.isEmpty()) {
            try {
                categoryEnum = TicketCategory.valueOf(category);
            } catch (IllegalArgumentException e) {
                // Invalid category - ignore filter
            }
        }
        
        // Handle search - if empty string, set to null
        String searchTerm = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        
        Page<Ticket> tickets = ticketRepository.findAllWithFilters(
            statusEnum, priorityEnum, categoryEnum, searchTerm, pageable
        );
        
        return tickets.map(ticketMapper::toResponse);
    }


}