package io.github.nanaaddae.ticket_support.knowledgebase.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
 
public record CreateDocumentRequest(
 
        @NotBlank(message = "Title is required")
        @Size(max = 255, message = "Title must be under 255 characters")
        String title,
 
        @NotBlank(message = "Content is required")
        String content
) {}
