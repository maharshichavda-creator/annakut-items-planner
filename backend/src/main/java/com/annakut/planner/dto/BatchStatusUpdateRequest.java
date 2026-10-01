package com.annakut.planner.dto;

import com.annakut.planner.domain.BatchStatus;
import jakarta.validation.constraints.NotNull;

/**
 * Updates the status of an entire batch (e.g. CONFIRMED or COLLECTED). This
 * applies to every item in the batch at once.
 */
public record BatchStatusUpdateRequest(
        @NotNull(message = "status is required") BatchStatus status,
        String notes
) {
}
