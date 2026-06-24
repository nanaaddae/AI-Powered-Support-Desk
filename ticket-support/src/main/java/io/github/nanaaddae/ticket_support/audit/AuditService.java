package io.github.nanaaddae.ticket_support.audit;

import io.github.nanaaddae.ticket_support.audit.enums.AuditAction;
import io.github.nanaaddae.ticket_support.user.User;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
 
import java.util.List;
import java.util.UUID;
 
@Service
@RequiredArgsConstructor
public class AuditService {
 
    private final AuditRepository auditRepository;
 
    @Async
    public void log(User actor, AuditAction action, String entityType, String entityId, String details) {
        AuditLog log = AuditLog.builder()
                .actorId(actor.getId())
                .actorEmail(actor.getEmail())
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .details(details)
                .build();
 
        auditRepository.save(log);
    }
 
    @Async
    public void log(User actor, AuditAction action, String entityType, String entityId) {
        log(actor, action, entityType, entityId, null);
    }
 
    public List<AuditLog> getLogsForEntity(String entityType, String entityId) {
        return auditRepository.findByEntityTypeAndEntityIdOrderByCreatedAtDesc(entityType, entityId);
    }
 
    public List<AuditLog> getLogsForActor(UUID actorId) {
        return auditRepository.findByActorIdOrderByCreatedAtDesc(actorId);
    }
 
    public List<AuditLog> getLogsByAction(AuditAction action) {
        return auditRepository.findByActionOrderByCreatedAtDesc(action);
    }

public Page<AuditLog> getAllLogs(Pageable pageable) {
    return auditRepository.findAll(pageable);
}


    public Page<AuditLog> getAllLogs(int page, int size, String action) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        if (action != null && !action.isEmpty() && !action.equals("ALL")) {
            return auditRepository.findByActionOrderByCreatedAtDesc(action, pageable);
        }
        return auditRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    public Page<AuditLog> getLogsByAction(String action, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return auditRepository.findByActionOrderByCreatedAtDesc(action, pageable);
    }

    public Page<AuditLog> getLogsForActor(Long actorId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return auditRepository.findByActorIdOrderByCreatedAtDesc(actorId, pageable);
    }
}

 
