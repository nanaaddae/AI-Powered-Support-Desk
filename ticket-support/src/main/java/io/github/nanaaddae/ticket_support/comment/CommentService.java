package io.github.nanaaddae.ticket_support.comment;

import io.github.nanaaddae.ticket_support.comment.dto.CommentResponse;
import io.github.nanaaddae.ticket_support.comment.dto.CreateCommentRequest;
import io.github.nanaaddae.ticket_support.comment.mapper.CommentMapper;
import io.github.nanaaddae.ticket_support.exception.ResourceNotFoundException;
import io.github.nanaaddae.ticket_support.tickets.Ticket;
import io.github.nanaaddae.ticket_support.tickets.TicketRepository;
import io.github.nanaaddae.ticket_support.user.User;
import io.github.nanaaddae.ticket_support.user.UserRepository;
import io.github.nanaaddae.ticket_support.user.enums.Role;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
 
import java.util.List;
import java.util.UUID;
 
@Service
@RequiredArgsConstructor
@Slf4j 
public class CommentService {
 
    private final CommentRepository commentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final CommentMapper commentMapper;
 
    public CommentResponse addComment(UUID ticketId, CreateCommentRequest request, String authorEmail) {
        User author = getUser(authorEmail);
        Ticket ticket = getTicket(ticketId);
 
        validateCanComment(author, ticket);
 
        Comment comment = Comment.builder()
                .content(request.content())
                .ticket(ticket)
                .author(author)
                .build();
 
        return commentMapper.toResponse(commentRepository.save(comment));
    }
 
    public List<CommentResponse> getCommentsForTicket(UUID ticketId, String requesterEmail) {
        User requester = getUser(requesterEmail);
        Ticket ticket = getTicket(ticketId);
 
        // Customers can only view comments on their own tickets
        if (requester.getRole() == Role.CUSTOMER &&
                !ticket.getCustomer().getId().equals(requester.getId())) {
            throw new RuntimeException("Access denied");
        }
 
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId)
                .stream()
                .map(commentMapper::toResponse)
                .toList();
    }
 
    public void deleteComment(UUID commentId, String requesterEmail) {
        User requester = getUser(requesterEmail);
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", commentId.toString()));
 
        Role role = requester.getRole();
 
        // Team leads and admins can delete any comment
        if (role == Role.TEAM_LEAD || role == Role.ADMIN) {
            commentRepository.delete(comment);
            return;
        }
 
        // Customers and agents can only delete their own comments
        if (!comment.getAuthor().getId().equals(requester.getId())) {
            throw new RuntimeException("Access denied");
        }
 
        commentRepository.delete(comment);
    }
 
    // --- helpers ---
 
    private void validateCanComment(User author, Ticket ticket) {
        switch (author.getRole()) {
            case CUSTOMER -> {
                if (!ticket.getCustomer().getId().equals(author.getId())) {
                    throw new RuntimeException("Customers can only comment on their own tickets");
                }
            }
            case AGENT -> {
                if (ticket.getAssignedAgent() == null ||
                        !ticket.getAssignedAgent().getId().equals(author.getId())) {
                    throw new RuntimeException("Agents can only comment on tickets assigned to them");
                }
            }
            case TEAM_LEAD, ADMIN -> {
                // can comment on any ticket
            }
        }
    }
 
    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
 
    private Ticket getTicket(UUID ticketId) {
        return ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
    }
}