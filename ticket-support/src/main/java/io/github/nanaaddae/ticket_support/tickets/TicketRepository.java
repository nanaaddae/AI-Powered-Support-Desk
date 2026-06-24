package io.github.nanaaddae.ticket_support.tickets;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import io.github.nanaaddae.ticket_support.tickets.enums.TicketCategory;
import io.github.nanaaddae.ticket_support.tickets.enums.TicketPriority;
import io.github.nanaaddae.ticket_support.tickets.enums.TicketStatus;
import io.github.nanaaddae.ticket_support.user.User;


public interface TicketRepository extends JpaRepository<Ticket, UUID> {

    List<Ticket> findByCustomer(User customer);

    List<Ticket> findByAssignedAgent(User agent);

    List<Ticket> findByCustomerOrderByCreatedAtDesc(User customer);
 
List<Ticket> findByAssignedAgentOrderByCreatedAtDesc(User agent);
 
List<Ticket> findAllByOrderByCreatedAtDesc();
 
long countByCustomer(User customer);
 
long countByAssignedAgent(User agent);
 
long countByAssignedAgentAndStatus(User agent, TicketStatus status);


 
@Query("SELECT t FROM Ticket t " +
       "JOIN t.customer c " +
       "WHERE (:status IS NULL OR t.status = :status) " +
       "AND (:priority IS NULL OR t.priority = :priority) " +
       "AND (:category IS NULL OR t.category = :category) " +
       "AND (:search IS NULL OR " +
       "LOWER(t.title) LIKE LOWER(CONCAT('%', CAST(:search AS text), '%')) OR " +
       "LOWER(t.description) LIKE LOWER(CONCAT('%', CAST(:search AS text), '%')) OR " +
       "LOWER(c.firstName) LIKE LOWER(CONCAT('%', CAST(:search AS text), '%')) OR " +
       "LOWER(c.lastName) LIKE LOWER(CONCAT('%', CAST(:search AS text), '%')) OR " +
       "LOWER(c.email) LIKE LOWER(CONCAT('%', CAST(:search AS text), '%')))")
Page<Ticket> findAllWithFilters(
        @Param("status") TicketStatus status,
        @Param("priority") TicketPriority priority,
        @Param("category") TicketCategory category,
        @Param("search") String search,
        Pageable pageable
);

}