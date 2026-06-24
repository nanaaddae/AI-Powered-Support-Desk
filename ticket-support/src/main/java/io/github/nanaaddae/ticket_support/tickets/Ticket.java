package io.github.nanaaddae.ticket_support.tickets;

import jakarta.persistence.*;
import lombok.*;
import io.github.nanaaddae.ticket_support.tickets.enums.*;
import io.github.nanaaddae.ticket_support.user.User;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "tickets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ticket {
 
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
 
    @Column(nullable = false)
    private String title;
 
    @Column(nullable = false, length = 5000)
    private String description;
 
    @Enumerated(EnumType.STRING)
    private TicketStatus status;
 
    @Enumerated(EnumType.STRING)
    private TicketPriority priority;
 
    @Enumerated(EnumType.STRING)
    private TicketCategory category;
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private User customer;
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_agent_id")
    private User assignedAgent;
 
    private Instant createdAt;
 
    private Instant updatedAt;
 
    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
        if (status == null) status = TicketStatus.OPEN;
        if (priority == null) priority = TicketPriority.MEDIUM;
    }
 
    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}
 