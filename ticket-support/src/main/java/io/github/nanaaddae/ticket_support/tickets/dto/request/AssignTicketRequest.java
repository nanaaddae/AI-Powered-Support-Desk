package io.github.nanaaddae.ticket_support.tickets.dto.request;

import java.util.UUID;
 
public record AssignTicketRequest(
        UUID agentId
) {}
 