package io.github.nanaaddae.ticket_support.ai;

import io.github.nanaaddae.ticket_support.ai.dto.ClassificationResult;
import io.github.nanaaddae.ticket_support.ai.dto.ResponseSuggestion;
import io.github.nanaaddae.ticket_support.ai.dto.SummarizationResult;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
 
import java.util.UUID;
 
@RestController
@RequestMapping("/api/v1/tickets/{ticketId}/ai")
@RequiredArgsConstructor
public class AiController {
 
    private final AiService aiService;
 
    // Agents, team leads, and admins can classify tickets
    @PostMapping("/classify")
    @PreAuthorize("hasAnyRole('AGENT', 'TEAM_LEAD', 'ADMIN')")
    public ResponseEntity<ClassificationResult> classify(
            @PathVariable UUID ticketId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(aiService.classifyTicket(ticketId, userDetails.getUsername()));
    }
 
    // Customers can also see a summary of their own ticket
    @GetMapping("/summarize")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'AGENT', 'TEAM_LEAD', 'ADMIN')")
    public ResponseEntity<SummarizationResult> summarize(
            @PathVariable UUID ticketId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(aiService.summarizeTicket(ticketId, userDetails.getUsername()));
    }
 
    // Only agents and above can get response suggestions
    @GetMapping("/suggest-response")
    @PreAuthorize("hasAnyRole('AGENT', 'TEAM_LEAD', 'ADMIN')")
    public ResponseEntity<ResponseSuggestion> suggestResponse(
            @PathVariable UUID ticketId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(aiService.suggestResponse(ticketId, userDetails.getUsername()));
    }
}