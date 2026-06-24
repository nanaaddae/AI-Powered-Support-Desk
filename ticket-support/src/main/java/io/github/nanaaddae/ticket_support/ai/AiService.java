package io.github.nanaaddae.ticket_support.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.nanaaddae.ticket_support.ai.client.LmStudioClient;
import io.github.nanaaddae.ticket_support.ai.dto.ClassificationResult;
import io.github.nanaaddae.ticket_support.ai.dto.ResponseSuggestion;
import io.github.nanaaddae.ticket_support.ai.dto.SummarizationResult;
import io.github.nanaaddae.ticket_support.audit.AuditService;
import io.github.nanaaddae.ticket_support.audit.enums.AuditAction;
import io.github.nanaaddae.ticket_support.comment.CommentRepository;
import io.github.nanaaddae.ticket_support.exception.ResourceNotFoundException;
import io.github.nanaaddae.ticket_support.tickets.Ticket;
import io.github.nanaaddae.ticket_support.tickets.TicketRepository;
import io.github.nanaaddae.ticket_support.tickets.enums.TicketCategory;
import io.github.nanaaddae.ticket_support.tickets.enums.TicketPriority;
import io.github.nanaaddae.ticket_support.user.User;
import io.github.nanaaddae.ticket_support.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import io.github.nanaaddae.ticket_support.knowledgebase.Document;
import io.github.nanaaddae.ticket_support.knowledgebase.DocumentRepository;
import io.github.nanaaddae.ticket_support.knowledgebase.EmbeddingService;



@Slf4j
@Service
@RequiredArgsConstructor
public class AiService {

    private final LmStudioClient lmStudioClient;
    private final TicketRepository ticketRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final ObjectMapper objectMapper;
    private final DocumentRepository documentRepository;
    private final EmbeddingService embeddingService;

   public ClassificationResult classifyTicket(UUID ticketId, String requesterEmail) {
    Ticket ticket = getTicket(ticketId);
    User requester = getUser(requesterEmail);
 
    String prompt = loadPrompt("prompts/classify-ticket.txt")
            .replace("{title}", ticket.getTitle())
            .replace("{description}", ticket.getDescription());
 
    String raw = lmStudioClient.chat(prompt);
 
    try {
        String cleaned = stripMarkdownFences(raw);
        var node = objectMapper.readTree(cleaned);
 
        TicketCategory category = TicketCategory.valueOf(node.get("category").asText());
        TicketPriority priority = TicketPriority.valueOf(node.get("priority").asText());
        String reasoning = node.get("reasoning").asText();
 
        // Auto-apply classification results to the ticket
        ticket.setCategory(category);
        ticket.setPriority(priority);
        ticketRepository.save(ticket);
 
        ClassificationResult result = ClassificationResult.builder()
                .category(category)
                .priority(priority)
                .reasoning(reasoning)
                .build();
 
        auditService.log(requester, AuditAction.AI_TICKET_CLASSIFIED, "TICKET",
                ticketId.toString(),
                "AI classified as " + category + " / " + priority);
 
        return result;
    } catch (Exception e) {
        log.error("Failed to parse classification response: {}", raw, e);
        throw new RuntimeException("AI classification failed — could not parse response");
    }
}


    public SummarizationResult summarizeTicket(UUID ticketId, String requesterEmail) {
        Ticket ticket = getTicket(ticketId);
        User requester = getUser(requesterEmail);

        String comments = buildCommentsText(ticketId);

        String prompt = loadPrompt("prompts/summarize-ticket.txt")
                .replace("{title}", ticket.getTitle())
                .replace("{description}", ticket.getDescription())
                .replace("{status}", ticket.getStatus().name())
                .replace("{priority}", ticket.getPriority().name())
                .replace("{category}", ticket.getCategory().name())
                .replace("{comments}", comments);

        String summary = lmStudioClient.chat(prompt);

        auditService.log(requester, AuditAction.AI_TICKET_SUMMARIZED, "TICKET",
                ticketId.toString(), "AI summarized ticket");

        return SummarizationResult.builder()
                .summary(summary.trim())
                .build();
    }

   public ResponseSuggestion suggestResponse(UUID ticketId, String requesterEmail) {
    Ticket ticket = getTicket(ticketId);
    User requester = getUser(requesterEmail);
 
    String comments = buildCommentsText(ticketId);
    String knowledgeBase = buildKnowledgeBaseContext(ticketId);
 
    String prompt = loadPrompt("prompts/suggest-response.txt")
            .replace("{title}", ticket.getTitle())
            .replace("{description}", ticket.getDescription())
            .replace("{status}", ticket.getStatus().name())
            .replace("{priority}", ticket.getPriority().name())
            .replace("{category}", ticket.getCategory().name())
            .replace("{comments}", comments)
            .replace("{knowledgeBase}", knowledgeBase);
 
    String raw = lmStudioClient.chat(prompt);
 
    try {
        String cleaned = stripMarkdownFences(raw);
        var node = objectMapper.readTree(cleaned);
        var options = objectMapper.readerForListOf(ResponseSuggestion.SuggestionOption.class)
        .<java.util.List<ResponseSuggestion.SuggestionOption>>readValue(node.get("options"));
 
        auditService.log(requester, AuditAction.AI_RESPONSE_SUGGESTED, "TICKET",
                ticketId.toString(), "AI generated response suggestions with KB context");
 
        return ResponseSuggestion.builder()
                .options(options)
                .build();
    } catch (Exception e) {
        log.error("Failed to parse suggestion response: {}", raw, e);
        throw new RuntimeException("AI response suggestion failed — could not parse response");
    }
}


    // --- helpers ---

    private String buildKnowledgeBaseContext(UUID ticketId) {
    try {
        Ticket ticket = getTicket(ticketId);
        String query = ticket.getTitle() + " " + ticket.getDescription();
        float[] embedding = embeddingService.embedQuery(query);
        String vectorString = embeddingService.toVectorString(embedding);
 
        List<Document> relevant = documentRepository.findSimilar(vectorString, 0.72, 3);
 
        if (relevant.isEmpty()) {
            return "No relevant knowledge base articles found.";
        }
 
        return relevant.stream()
                .map(doc -> "Article: " + doc.getTitle() + "\n" + doc.getContent())
                .collect(Collectors.joining("\n\n---\n\n"));
    } catch (Exception e) {
        log.warn("Could not fetch KB context for ticket {}: {}", ticketId, e.getMessage());
        return "No relevant knowledge base articles found.";
    }
}

    private String buildCommentsText(UUID ticketId) {
        var comments = commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
        if (comments.isEmpty()) return "No comments yet.";
        return comments.stream()
                .map(c -> "[" + c.getAuthor().getFirstName() + " " + c.getAuthor().getLastName()
                        + "]: " + c.getContent())
                .collect(Collectors.joining("\n"));
    }

    private String loadPrompt(String path) {
        try {
            return new ClassPathResource(path)
                    .getContentAsString(StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new RuntimeException("Could not load prompt template: " + path, e);
        }
    }

    // LLMs sometimes wrap JSON in ```json ... ``` even when told not to
    private String stripMarkdownFences(String raw) {
        return raw.replaceAll("(?s)```json\\s*", "")
                  .replaceAll("(?s)```\\s*", "")
                  .trim();
    }

    private Ticket getTicket(UUID ticketId) {
        return ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", ticketId.toString()));
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
}