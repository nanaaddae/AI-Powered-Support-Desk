package io.github.nanaaddae.ticket_support.auth;

import io.github.nanaaddae.ticket_support.auth.dto.*;
import io.github.nanaaddae.ticket_support.security.JwtService;
import io.github.nanaaddae.ticket_support.user.User;
import io.github.nanaaddae.ticket_support.user.UserRepository;
import io.github.nanaaddae.ticket_support.user.enums.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    
    public RegisterResponse register(RegisterRequest request) {
    if (userRepository.existsByEmail(request.email())) {
        throw new IllegalArgumentException("Email already in use");
    }
 
    // Only CUSTOMER and AGENT allowed on self-registration
    Role role = request.role() != null &&
                (request.role() == Role.CUSTOMER || request.role() == Role.AGENT)
            ? request.role()
            : Role.CUSTOMER;
 
    User user = User.builder()
            .firstName(request.firstName())
            .lastName(request.lastName())
            .email(request.email())
            .password(passwordEncoder.encode(request.password()))
            .role(role)
            .build();
 
    User saved = userRepository.save(user);
 
    return RegisterResponse.builder()
            .id(saved.getId())
            .firstName(saved.getFirstName())
            .lastName(saved.getLastName())
            .email(saved.getEmail())
            .role(saved.getRole())
            .build();
}
 

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String token = jwtService.generateToken(user);
        return AuthResponse.of(token);
    }
}