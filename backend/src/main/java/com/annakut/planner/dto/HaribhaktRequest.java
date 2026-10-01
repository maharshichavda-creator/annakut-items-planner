package com.annakut.planner.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record HaribhaktRequest(
        @NotBlank(message = "name is required") @Size(max = 150) String name,
        @Size(max = 20) String mobileNumber,
        @Size(max = 500) String address,
        @Size(max = 500) String notes
) {
}
