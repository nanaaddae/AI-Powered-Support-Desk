package io.github.nanaaddae.ticket_support.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

 import org.springframework.beans.factory.annotation.Value;
@Configuration
public class AiConfig {
 

    @Value("${groq.api.key}") 
    private String groqApiKey;

  
  
 @Bean
public RestClient lmStudioRestClient() {

    

    return RestClient.builder()
            .baseUrl("https://api.groq.com/openai/v1")
            .defaultHeader("Authorization", "Bearer " + groqApiKey)
            .defaultHeader("Content-Type", "application/json")
            .build();


        }
             
}
 