package io.github.nanaaddae.ticket_support.knowledgebase;

import io.github.nanaaddae.ticket_support.knowledgebase.dto.CreateDocumentRequest;
import io.github.nanaaddae.ticket_support.knowledgebase.dto.DocumentResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
 
import java.util.List;
import java.util.UUID;
 
@RestController
@RequestMapping("/api/v1/knowledgebase")
@RequiredArgsConstructor
public class DocumentController {
 
    private final DocumentService documentService;
 
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DocumentResponse> createDocument(
            @Valid @RequestBody CreateDocumentRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(documentService.createDocument(request, userDetails.getUsername()));
    }
 
    @GetMapping
    @PreAuthorize("hasAnyRole('AGENT', 'TEAM_LEAD', 'ADMIN')")
    public ResponseEntity<List<DocumentResponse>> getAllDocuments() {
        return ResponseEntity.ok(documentService.getAllDocuments());
    }
 
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('AGENT', 'TEAM_LEAD', 'ADMIN')")
    public ResponseEntity<DocumentResponse> getDocumentById(@PathVariable UUID id) {
        return ResponseEntity.ok(documentService.getDocumentById(id));
    }
 
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('AGENT', 'TEAM_LEAD', 'ADMIN')")
    public ResponseEntity<List<DocumentResponse>> search(@RequestParam String query) {
        return ResponseEntity.ok(documentService.search(query));
    }
 
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        documentService.deleteDocument(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}