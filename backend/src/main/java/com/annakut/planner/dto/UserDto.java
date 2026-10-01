package com.annakut.planner.dto;

import com.annakut.planner.domain.Role;
import com.annakut.planner.domain.User;

public record UserDto(
        Long id,
        String username,
        String fullName,
        Role role,
        boolean enabled
) {
    public static UserDto from(User u) {
        return new UserDto(u.getId(), u.getUsername(), u.getFullName(), u.getRole(), u.isEnabled());
    }
}
