package io.github.nanaaddae.ticket_support.comment;

import org.springframework.data.jpa.repository.JpaRepository;
 
import java.util.List;
import java.util.UUID;
 
public interface CommentRepository extends JpaRepository<Comment, UUID> {
 
    List<Comment> findByTicketIdOrderByCreatedAtAsc(UUID ticketId);
}
 

