package io.github.nanaaddae.ticket_support.dashboard;

import io.github.nanaaddae.ticket_support.dashboard.dto.AdminDashboardResponse;
import io.github.nanaaddae.ticket_support.dashboard.dto.AgentDashboardResponse;
import io.github.nanaaddae.ticket_support.dashboard.dto.CustomerDashboardResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
 
@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {
 
    private final DashboardService dashboardService;
 
    @GetMapping("/customer")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<CustomerDashboardResponse> getCustomerDashboard(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(dashboardService.getCustomerDashboard(userDetails.getUsername()));
    }
 
    @GetMapping("/agent")
    @PreAuthorize("hasRole('AGENT')")
    public ResponseEntity<AgentDashboardResponse> getAgentDashboard(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(dashboardService.getAgentDashboard(userDetails.getUsername()));
    }
 
    @GetMapping("/admin")
    @PreAuthorize("hasAnyRole('TEAM_LEAD', 'ADMIN')")
    public ResponseEntity<AdminDashboardResponse> getAdminDashboard() {
        return ResponseEntity.ok(dashboardService.getAdminDashboard());
    }
}