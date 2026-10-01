package com.annakut.planner.service;

import com.annakut.planner.domain.Role;
import com.annakut.planner.domain.User;
import com.annakut.planner.dto.auth.LoginRequest;
import com.annakut.planner.dto.auth.LoginResponse;
import com.annakut.planner.repository.UserRepository;
import com.annakut.planner.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public AuthService(AuthenticationManager authenticationManager,
                        UserDetailsService userDetailsService,
                        UserRepository userRepository,
                        JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password()));

        var userDetails = userDetailsService.loadUserByUsername(request.username());
        User user = userRepository.findByUsername(request.username()).orElseThrow();
        String token = jwtService.generateToken(userDetails);

        return new LoginResponse(token, user.getUsername(), user.getFullName(), user.getRole().name());
    }

    public Role currentRole(String username) {
        return userRepository.findByUsername(username).map(User::getRole).orElse(null);
    }

    public LoginResponse me(String username) {
        User user = userRepository.findByUsername(username).orElseThrow();
        return new LoginResponse(null, user.getUsername(), user.getFullName(), user.getRole().name());
    }
}
