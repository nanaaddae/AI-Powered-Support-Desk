package io.github.nanaaddae.ticket_support.user;

import io.github.nanaaddae.ticket_support.audit.AuditService;
import io.github.nanaaddae.ticket_support.audit.enums.AuditAction;
import io.github.nanaaddae.ticket_support.exception.ResourceNotFoundException;
import io.github.nanaaddae.ticket_support.user.dto.UpdateRoleRequest;
import io.github.nanaaddae.ticket_support.user.dto.UserResponse;
import io.github.nanaaddae.ticket_support.user.enums.Role;
import io.github.nanaaddae.ticket_support.user.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
 
import java.util.List;
import java.util.UUID;
 
@Service
@RequiredArgsConstructor
public class UserService {
 
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final AuditService auditService;
 
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(userMapper::toResponse)
                .toList();
    }
 
    public List<UserResponse> getUsersByRole(Role role) {
        return userRepository.findByRole(role)
                .stream()
                .map(userMapper::toResponse)
                .toList();
    }
 
    public UserResponse getUserById(UUID id) {
        return userRepository.findById(id)
                .map(userMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("User", id.toString()));
    }
 
    public UserResponse updateRole(UUID targetUserId, UpdateRoleRequest request, String requesterEmail) {
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
 
        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", targetUserId.toString()));
 
        // Prevent admins from changing their own role
        if (target.getId().equals(requester.getId())) {
            throw new IllegalArgumentException("You cannot change your own role");
        }
 
        Role previousRole = target.getRole();
        target.setRole(request.role());
        User saved = userRepository.save(target);
 
        auditService.log(requester, AuditAction.USER_ROLE_CHANGED, "USER", targetUserId.toString(),
                "Role changed from " + previousRole + " to " + request.role());
 
        return userMapper.toResponse(saved);
    }
 
    public void deleteUser(UUID targetUserId, String requesterEmail) {
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
 
        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", targetUserId.toString()));
 
        // Prevent admins from deleting themselves
        if (target.getId().equals(requester.getId())) {
            throw new IllegalArgumentException("You cannot delete your own account");
        }
 
        userRepository.delete(target);
    }
}
 