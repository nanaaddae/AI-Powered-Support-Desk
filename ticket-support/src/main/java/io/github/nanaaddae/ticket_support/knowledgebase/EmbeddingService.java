package io.github.nanaaddae.ticket_support.knowledgebase;

import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.cohere.CohereEmbeddingModel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmbeddingService {

    private final EmbeddingModel documentModel;
    private final EmbeddingModel queryModel;

    public EmbeddingService(@Value("${cohere.api.key}") String apiKey) {
        // Model optimized for indexing/saving KB articles
        this.documentModel = CohereEmbeddingModel.builder()
                .apiKey(apiKey)
                .modelName("embed-english-v3.0")
                .inputType("search_document")
                .build();

        // Model optimized for real-time search queries and ticket descriptions
        this.queryModel = CohereEmbeddingModel.builder()
                .apiKey(apiKey)
                .modelName("embed-english-v3.0")
                .inputType("search_query")
                .build();
    }

    /**
     * Use this ONLY when an Admin creates a new Knowledge Base document.
     */
    public float[] embedDocument(String text) {
        try {
            return documentModel.embed(text).content().vector();
        } catch (Exception e) {
            log.error("Failed to generate document embedding via Cohere", e);
            throw new RuntimeException("Document embedding generation failed", e);
        }
    }

    /**
     * Use this when searching the KB or pulling suggestions for a ticket.
     */
    public float[] embedQuery(String text) {
        try {
            return queryModel.embed(text).content().vector();
        } catch (Exception e) {
            log.error("Failed to generate query embedding via Cohere", e);
            throw new RuntimeException("Query embedding generation failed", e);
        }
    }

    public String toVectorString(float[] embedding) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < embedding.length; i++) {
            sb.append(embedding[i]);
            if (i < embedding.length - 1) sb.append(",");
        }
        sb.append("]");
        return sb.toString();
    }
}