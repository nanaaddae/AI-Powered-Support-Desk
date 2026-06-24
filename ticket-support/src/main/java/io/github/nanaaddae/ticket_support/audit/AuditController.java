package io.github.nanaaddae.ticket_support.audit;

import io.github.nanaaddae.ticket_support.audit.enums.AuditAction;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
 
import java.util.List;
import java.util.UUID;
 
@RestController
@RequestMapping("/api/v1/audit")
@RequiredArgsConstructor
public class AuditController {
 
    private final AuditService auditService;
 
  
    @GetMapping
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<Page<AuditLog>> getAllLogs(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
) {
    return ResponseEntity.ok(auditService.getAllLogs(PageRequest.of(page, size, Sort.by("createdAt").descending())));
}

    @GetMapping("/action/{action}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditLog>> getLogsByAction(@PathVariable AuditAction action) {
        return ResponseEntity.ok(auditService.getLogsByAction(action));
    }
 
    @GetMapping("/actor/{actorId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditLog>> getLogsByActor(@PathVariable UUID actorId) {
        return ResponseEntity.ok(auditService.getLogsForActor(actorId));
    }
}