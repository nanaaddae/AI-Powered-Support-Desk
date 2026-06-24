package io.github.nanaaddae.ticket_support.comment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
 
public record CreateCommentRequest(
 
        @NotBlank(message = "Comment content is required")
        @Size(max = 2000, message = "Comment must be under 2000 characters")
        String content
) {}
 