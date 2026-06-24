CREATE EXTENSION IF NOT EXISTS vector;
 
CREATE TABLE knowledge_base_documents
(
    id        UUID PRIMARY KEY,
 
    title     VARCHAR(255)  NOT NULL,
 
    content   TEXT          NOT NULL,
 
    embedding vector(384),
 
    author_id UUID          NOT NULL,
 
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
 
    updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
 
    CONSTRAINT fk_document_author
        FOREIGN KEY (author_id)
        REFERENCES users(id)
);
 
CREATE INDEX idx_document_author
    ON knowledge_base_documents(author_id);
 