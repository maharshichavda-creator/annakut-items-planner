package com.annakut.planner.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record FestivalEventRequest(
        @NotNull(message = "year is required") @Min(2000) Integer year,
        @NotBlank(message = "name is required") @Size(max = 255) String name,
        @Size(max = 255) String location,
        @NotNull(message = "annakutDate is required") LocalDate annakutDate,
        Boolean active
) {
}
