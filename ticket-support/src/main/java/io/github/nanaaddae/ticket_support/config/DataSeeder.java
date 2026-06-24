package io.github.nanaaddae.ticket_support.config;

import io.github.nanaaddae.ticket_support.user.User;
import io.github.nanaaddae.ticket_support.user.UserRepository;
import io.github.nanaaddae.ticket_support.user.enums.Role;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        seedDemoUsers();
    }

    private void seedDemoUsers() {
        List<DemoUser> demoUsers = List.of(
            new DemoUser("Admin", "User", "admin@supportdesk.com", Role.ADMIN),
            new DemoUser("Agent", "Demo", "agent@supportdesk.com", Role.AGENT),
            new DemoUser("Team", "Lead", "teamlead@supportdesk.com", Role.TEAM_LEAD),
            new DemoUser("Customer", "Demo", "customer@supportdesk.com", Role.CUSTOMER)
        );

        for (DemoUser demo : demoUsers) {
            if (userRepository.existsByEmail(demo.email())) {
                log.info("Demo user {} already exists, skipping.", demo.email());
                continue;
            }

            User user = User.builder()
                    .firstName(demo.firstName())
                    .lastName(demo.lastName())
                    .email(demo.email())
                    .password(passwordEncoder.encode("password123"))
                    .role(demo.role())
                    .build();

            userRepository.save(user);
            log.info("Seeded demo user: {} ({})", demo.email(), demo.role());
        }
    }

    private record DemoUser(String firstName, String lastName, String email, Role role) {}
}