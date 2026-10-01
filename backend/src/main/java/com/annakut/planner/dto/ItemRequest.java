package com.annakut.planner.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ItemRequest(
        @NotBlank(message = "name is required") @Size(max = 255) String name,
        @NotBlank(message = "category is required") @Size(max = 100) String category,
        @Min(value = 1, message = "bowlCount must be at least 1") Integer bowlCount,
        @Size(max = 500) String note,
        Boolean active
) {
}
