package io.github.nanaaddae.ticket_support.knowledgebase;

import io.github.nanaaddae.ticket_support.exception.ForbiddenException;
import io.github.nanaaddae.ticket_support.exception.ResourceNotFoundException;
import io.github.nanaaddae.ticket_support.knowledgebase.dto.CreateDocumentRequest;
import io.github.nanaaddae.ticket_support.knowledgebase.dto.DocumentResponse;
import io.github.nanaaddae.ticket_support.knowledgebase.mapper.DocumentMapper;
import io.github.nanaaddae.ticket_support.tickets.Ticket;
import io.github.nanaaddae.ticket_support.tickets.TicketRepository;
import io.github.nanaaddae.ticket_support.user.User;
import io.github.nanaaddae.ticket_support.user.UserRepository;
import io.github.nanaaddae.ticket_support.user.enums.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
 
import java.util.List;
import java.util.UUID;
 
@Service
@RequiredArgsConstructor
public class DocumentService {
 
    private final DocumentRepository documentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final EmbeddingService embeddingService;
    private final DocumentMapper documentMapper;
 
    public DocumentResponse createDocument(CreateDocumentRequest request, String authorEmail) {
        User author = getUser(authorEmail);
 
        float[] embedding = embeddingService.embedDocument(request.title() + " " + request.content()); 
        Document document = Document.builder()
                .title(request.title())
                .content(request.content())
                .embedding(embedding)
                .author(author)
                .build();
 
        return documentMapper.toResponse(documentRepository.save(document));
    }
 
    public List<DocumentResponse> getAllDocuments() {
        return documentRepository.findAll()
                .stream()
                .map(documentMapper::toResponse)
                .toList();
    }
 
    public DocumentResponse getDocumentById(UUID id) {
        return documentRepository.findById(id)
                .map(documentMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Document", id.toString()));
    }
 
public List<DocumentResponse> search(String query) {
        // FIX: Use embedQuery for search operations
        float[] embedding = embeddingService.embedQuery(query);
        String vectorString = embeddingService.toVectorString(embedding);
        
        // Adjust threshold down to 0.50 for asymmetric math
        return documentRepository.findSimilar(vectorString, .72, 3)
                .stream()
                .map(documentMapper::toResponse)
                .toList();
    }

    public List<DocumentResponse> suggestForTicket(UUID ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", ticketId.toString()));

        String query = ticket.getTitle() + " " + ticket.getDescription();
        
        // FIX: Use embedQuery for ticket processing
        float[] embedding = embeddingService.embedQuery(query);
        String vectorString = embeddingService.toVectorString(embedding);

        // 🌟 ADD THIS TEMPORARY LINE RIGHT HERE:


        // Adjust threshold down to 0.50 for asymmetric math
        return documentRepository.findSimilar(vectorString, .72 , 3)
                .stream()
                .map(documentMapper::toResponse)
                .toList();
    } 


    public void deleteDocument(UUID id, String requesterEmail) {
        User requester = getUser(requesterEmail);
 
        if (requester.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Only admins can delete knowledge base documents");
        }
 
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document", id.toString()));
 
        documentRepository.delete(document);
    }
 
    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
}