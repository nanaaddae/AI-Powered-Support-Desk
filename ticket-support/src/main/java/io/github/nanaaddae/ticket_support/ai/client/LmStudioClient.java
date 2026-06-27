package io.github.nanaaddae.ticket_support.ai.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
 
import java.util.List;
import java.util.Map;
 
@Slf4j
@Component
@RequiredArgsConstructor
public class LmStudioClient {
 
    private final RestClient lmStudioRestClient;
    private final ObjectMapper objectMapper;
 
    public String chat(String prompt) {
        Map<String, Object> requestBody = Map.of(
                "model", "openai/gpt-oss-20b",
                "messages", List.of(
                        Map.of("role", "user", "content", prompt)
                ),
                "temperature", 0.3
        );
 
        try {
            String responseBody = lmStudioRestClient.post()
                    .uri("/chat/completions")
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);
 
            var root = objectMapper.readTree(responseBody);
            return root.get("choices").get(0).get("message").get("content").asText();
        } catch (Exception e) {
            log.error("LM Studio request failed", e);
            throw new RuntimeException("Failed to get response from LM Studio", e);
        }
    }
}
 