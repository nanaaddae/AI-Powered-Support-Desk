package io.github.nanaaddae.ticket_support.ai.dto;
import lombok.Builder;
 
import java.util.List;
 
@Builder
public record ResponseSuggestion(
        List<SuggestionOption> options
) {
    @Builder
    public record SuggestionOption(
            String label,
            String response
    ) {}
}
 
