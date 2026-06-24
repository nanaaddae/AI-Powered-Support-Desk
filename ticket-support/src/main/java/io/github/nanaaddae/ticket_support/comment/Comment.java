package io.github.nanaaddae.ticket_support.comment;

import io.github.nanaaddae.ticket_support.tickets.Ticket;
import io.github.nanaaddae.ticket_support.user.User;
import jakarta.persistence.*;
import lombok.*;
 
import java.time.Instant;
import java.util.UUID;
 
@Entity
@Table(name = "comments")
@Getter 
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comment {
 
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
 
    @Column(nullable = false, length = 2000)
    private String content;
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;
 
    private Instant createdAt;
 
    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}