package com.annakut.planner.dto.auth;

public record LoginResponse(
        String token,
        String username,
        String fullName,
        String role
) {
}
