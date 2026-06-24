package io.github.nanaaddae.ticket_support.config;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
 
@Configuration
public class JacksonConfig {
 
    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
 
        // Handle Java 8 date/time types (Instant, LocalDate, etc.)
        mapper.registerModule(new JavaTimeModule());
 
        // Write dates as ISO-8601 strings, not timestamps
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
 
        // Don't fail on unknown properties coming in from the client
        mapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
 
        // Skip null fields in responses
        mapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
 
        return mapper;
    }
}
 