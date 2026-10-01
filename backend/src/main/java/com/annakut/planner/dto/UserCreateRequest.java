package com.annakut.planner.dto;

import com.annakut.planner.domain.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UserCreateRequest(
        @NotBlank(message = "username is required") @Size(max = 50) String username,
        @NotBlank(message = "password is required") @Size(min = 6, message = "password must be at least 6 characters") String password,
        @NotBlank(message = "fullName is required") @Size(max = 150) String fullName,
        @NotNull(message = "role is required") Role role
) {
}
