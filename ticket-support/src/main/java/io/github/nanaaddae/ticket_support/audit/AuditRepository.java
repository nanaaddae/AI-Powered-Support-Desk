package io.github.nanaaddae.ticket_support.audit;
import io.github.nanaaddae.ticket_support.audit.enums.AuditAction;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;
 
public interface AuditRepository extends JpaRepository<AuditLog, UUID> {
 
    List<AuditLog> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(String entityType, String entityId);
 
    List<AuditLog> findByActorIdOrderByCreatedAtDesc(UUID actorId);
 
    List<AuditLog> findByActionOrderByCreatedAtDesc(AuditAction action);

    List<AuditLog> findAllByOrderByCreatedAtDesc();


        Page<AuditLog> findAllByOrderByCreatedAtDesc(Pageable pageable);
    
    Page<AuditLog> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(String entityType, Long entityId, Pageable pageable);
    
    Page<AuditLog> findByActorIdOrderByCreatedAtDesc(Long actorId, Pageable pageable);
    
    Page<AuditLog> findByActionOrderByCreatedAtDesc(String action, Pageable pageable);
    
    // For action filtering with pagination
    @Query("SELECT a FROM AuditLog a WHERE (:action IS NULL OR a.action = :action) ORDER BY a.createdAt DESC")
    Page<AuditLog> findByAction(@Param("action") String action, Pageable pageable);
}

 