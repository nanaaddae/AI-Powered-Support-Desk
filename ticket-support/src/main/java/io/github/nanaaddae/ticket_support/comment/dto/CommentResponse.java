package io.github.nanaaddae.ticket_support.comment.dto;

import lombok.Builder;
 
import java.time.Instant;
import java.util.UUID;
 
@Builder
public record CommentResponse(
        UUID id,
        String content,
        UUID ticketId,
        UUID authorId,
        String authorName,
        Instant createdAt
) {}
 