package io.github.nanaaddae.ticket_support.audit;

import io.github.nanaaddae.ticket_support.audit.enums.AuditAction;
import jakarta.persistence.*;
import lombok.*;
 
import java.time.Instant;
import java.util.UUID;
 
@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {
 
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
 
    // Who performed the action
    @Column(name = "actor_id", nullable = false)
    private UUID actorId;
 
    @Column(name = "actor_email", nullable = false)
    private String actorEmail;
 
    // What they did
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuditAction action;
 
    // Which entity was affected
    @Column(name = "entity_type", nullable = false)
    private String entityType;
 
    @Column(name = "entity_id", nullable = false)
    private String entityId;
 
    // Optional human-readable detail (e.g. "Status changed from OPEN to IN_PROGRESS")
    @Column(length = 1000)
    private String details;
 
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
 
    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}
 