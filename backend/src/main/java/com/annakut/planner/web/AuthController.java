package com.annakut.planner.web;

import com.annakut.planner.dto.auth.LoginRequest;
import com.annakut.planner.dto.auth.LoginResponse;
import com.annakut.planner.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public LoginResponse me(@AuthenticationPrincipal UserDetails principal) {
        return authService.me(principal.getUsername());
    }
}
