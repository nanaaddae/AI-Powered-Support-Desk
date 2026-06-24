package io.github.nanaaddae.ticket_support.knowledgebase.dto;

import lombok.Builder;
 
import java.time.Instant;
import java.util.UUID;
 
@Builder
public record DocumentResponse(
        UUID id,
        String title,
        String content,
        UUID authorId,
        String authorName,
        Instant createdAt,
        Instant updatedAt
) {}