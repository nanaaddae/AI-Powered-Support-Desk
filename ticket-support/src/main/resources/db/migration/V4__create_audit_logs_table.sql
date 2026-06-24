CREATE TABLE audit_logs
(
    id          UUID PRIMARY KEY,
 
    actor_id    UUID         NOT NULL,
 
    actor_email VARCHAR(255) NOT NULL,
 
    action      VARCHAR(100) NOT NULL,
 
    entity_type VARCHAR(100) NOT NULL,
 
    entity_id   VARCHAR(255) NOT NULL,
 
    details     VARCHAR(1000),
 
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
 
CREATE INDEX idx_audit_entity
    ON audit_logs(entity_type, entity_id);
 
CREATE INDEX idx_audit_actor
    ON audit_logs(actor_id);
 
CREATE INDEX idx_audit_action
    ON audit_logs(action);