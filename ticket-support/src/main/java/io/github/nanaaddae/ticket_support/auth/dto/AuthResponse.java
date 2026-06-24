package io.github.nanaaddae.ticket_support.auth.dto;

import lombok.Builder;
 
@Builder
public record AuthResponse(
        String accessToken,
        String tokenType
) {
    public static AuthResponse of(String token) {
        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .build();
    }
}
 