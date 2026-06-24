package io.github.nanaaddae.ticket_support.audit.enums;

public enum AuditAction {
 
    // Ticket actions
    TICKET_CREATED,
    TICKET_STATUS_CHANGED,
    TICKET_ASSIGNED,
    TICKET_PRIORITY_CHANGED,
    TICKET_CLOSED,
    TICKET_REOPENED,
 
    // Comment actions
    COMMENT_ADDED,
    COMMENT_DELETED,
 
    // User actions
    USER_REGISTERED,
    USER_ROLE_CHANGED,
 
    // AI actions (ready for when AI package is built)
    AI_TICKET_CLASSIFIED,
    AI_TICKET_SUMMARIZED,
    AI_RESPONSE_SUGGESTED
}
 