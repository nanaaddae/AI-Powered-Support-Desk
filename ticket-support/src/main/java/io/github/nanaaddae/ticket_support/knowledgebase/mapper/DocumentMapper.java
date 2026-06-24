package io.github.nanaaddae.ticket_support.knowledgebase.mapper;

import io.github.nanaaddae.ticket_support.knowledgebase.Document;
import io.github.nanaaddae.ticket_support.knowledgebase.dto.DocumentResponse;
import org.springframework.stereotype.Component;
 
@Component
public class DocumentMapper {
 
    public DocumentResponse toResponse(Document document) {
        return DocumentResponse.builder()
                .id(document.getId())
                .title(document.getTitle())
                .content(document.getContent())
                .authorId(document.getAuthor().getId())
                .authorName(document.getAuthor().getFirstName() + " " + document.getAuthor().getLastName())
                .createdAt(document.getCreatedAt())
                .updatedAt(document.getUpdatedAt())
                .build();
    }
}
