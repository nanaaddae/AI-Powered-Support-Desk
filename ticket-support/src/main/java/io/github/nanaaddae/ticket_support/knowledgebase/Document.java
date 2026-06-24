package io.github.nanaaddae.ticket_support.knowledgebase;

import io.github.nanaaddae.ticket_support.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Array;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
 
import java.time.Instant;
import java.util.UUID;
 
@Entity
@Table(name = "knowledge_base_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document {
 
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
 
    @Column(nullable = false)
    private String title;
 
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
 
    @Array(length = 384)
    @JdbcTypeCode(SqlTypes.VECTOR)
    @Column(name = "embedding", columnDefinition = "vector(384)")
    private float[] embedding;
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;
 
    private Instant createdAt;
 
    private Instant updatedAt;
 
    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }
 
    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}