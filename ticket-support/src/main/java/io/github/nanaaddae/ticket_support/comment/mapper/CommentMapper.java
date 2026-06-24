package io.github.nanaaddae.ticket_support.comment.mapper;

import io.github.nanaaddae.ticket_support.comment.Comment;
import io.github.nanaaddae.ticket_support.comment.dto.CommentResponse;
import org.springframework.stereotype.Component;
 
@Component
public class CommentMapper {
 
    public CommentResponse toResponse(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .ticketId(comment.getTicket().getId())
                .authorId(comment.getAuthor().getId())
                .authorName(comment.getAuthor().getFirstName() + " " + comment.getAuthor().getLastName())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
 