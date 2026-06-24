CREATE TABLE tickets
(
    id UUID PRIMARY KEY,

    title VARCHAR(255) NOT NULL,

    description VARCHAR(5000) NOT NULL,

    status VARCHAR(50),

    priority VARCHAR(50),

    category VARCHAR(50),

    customer_id UUID NOT NULL,

    assigned_agent_id UUID,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_ticket_customer
        FOREIGN KEY (customer_id)
        REFERENCES users(id),

    CONSTRAINT fk_ticket_agent
        FOREIGN KEY (assigned_agent_id)
        REFERENCES users(id)
);


CREATE INDEX idx_ticket_customer
    ON tickets(customer_id);

CREATE INDEX idx_ticket_agent
    ON tickets(assigned_agent_id);