CREATE TABLE comments
(
    id UUID PRIMARY KEY,
 
    content VARCHAR(2000) NOT NULL,
 
    ticket_id UUID NOT NULL,
 
    author_id UUID NOT NULL,
 
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 
    CONSTRAINT fk_comment_ticket
        FOREIGN KEY (ticket_id)
        REFERENCES tickets(id)
        ON DELETE CASCADE,
 
    CONSTRAINT fk_comment_author
        FOREIGN KEY (author_id)
        REFERENCES users(id)
);
 
CREATE INDEX idx_comment_ticket
    ON comments(ticket_id);
 
CREATE INDEX idx_comment_author
    ON comments(author_id);
 