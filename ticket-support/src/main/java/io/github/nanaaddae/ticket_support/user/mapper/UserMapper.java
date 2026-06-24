package io.github.nanaaddae.ticket_support.user.mapper;

import io.github.nanaaddae.ticket_support.user.User;
import io.github.nanaaddae.ticket_support.user.dto.UserResponse;
import org.springframework.stereotype.Component;
 
@Component
public class UserMapper {
 
   public UserResponse toResponse(User user) {
    return new UserResponse(
            user.getId(),
            user.getFirstName(),
            user.getLastName(),
            user.getEmail(),
            user.getRole()
    );
}

}
 