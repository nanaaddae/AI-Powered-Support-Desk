package io.github.nanaaddae.ticket_support.tickets;

import io.github.nanaaddae.ticket_support.knowledgebase.DocumentService;
import io.github.nanaaddae.ticket_support.knowledgebase.dto.DocumentResponse;
import io.github.nanaaddae.ticket_support.tickets.dto.CreateTicketRequest;
import io.github.nanaaddae.ticket_support.tickets.dto.TicketResponse;
import io.github.nanaaddae.ticket_support.tickets.dto.request.AssignTicketRequest;
import io.github.nanaaddae.ticket_support.tickets.dto.request.UpdateTicketPriorityRequest;
import io.github.nanaaddae.ticket_support.tickets.dto.request.UpdateTicketStatusRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;
    private final DocumentService documentService;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<TicketResponse> createTicket(
            @Valid @RequestBody CreateTicketRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ticketService.createTicket(request, userDetails.getUsername()));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<TicketResponse>> getMyTickets(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ticketService.getMyTickets(userDetails.getUsername()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'AGENT', 'TEAM_LEAD', 'ADMIN')")
    public ResponseEntity<TicketResponse> getTicketById(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ticketService.getTicketById(id, userDetails.getUsername()));
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('AGENT', 'TEAM_LEAD', 'ADMIN')")
    public ResponseEntity<TicketResponse> assignTicket(
            @PathVariable UUID id,
            @RequestBody AssignTicketRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ticketService.assignTicket(id, request, userDetails.getUsername()));
    }

    @GetMapping("/{id}/knowledgebase/suggestions")
    @PreAuthorize("hasAnyRole('AGENT', 'TEAM_LEAD', 'ADMIN')")
    public ResponseEntity<List<DocumentResponse>> getKnowledgeBaseSuggestions(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(documentService.suggestForTicket(id));
    }

    @GetMapping("/assigned")
    @PreAuthorize("hasRole('AGENT')")
    public ResponseEntity<List<TicketResponse>> getAssignedTickets(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ticketService.getAssignedTickets(userDetails.getUsername()));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('AGENT', 'TEAM_LEAD', 'ADMIN')")
    public ResponseEntity<TicketResponse> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateTicketStatusRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ticketService.updateStatus(id, request, userDetails.getUsername()));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('TEAM_LEAD', 'ADMIN')")
    public ResponseEntity<Page<TicketResponse>> getAllTickets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir
    ) {
        return ResponseEntity.ok(ticketService.getAllTickets(
            page, size, status, priority, category, search, sortBy, sortDir
        ));
    }

    @PatchMapping("/{id}/priority")
    @PreAuthorize("hasAnyRole('TEAM_LEAD', 'ADMIN')")
    public ResponseEntity<TicketResponse> updatePriority(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateTicketPriorityRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ticketService.updatePriority(id, request, userDetails.getUsername()));
    }
}