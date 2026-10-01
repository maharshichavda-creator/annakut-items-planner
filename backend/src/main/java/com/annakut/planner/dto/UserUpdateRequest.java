package com.annakut.planner.dto;

import com.annakut.planner.domain.Role;

public record UserUpdateRequest(
        Role role,
        Boolean enabled,
        String fullName
) {
}
