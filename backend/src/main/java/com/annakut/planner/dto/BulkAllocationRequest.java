package com.annakut.planner.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/**
 * Creates a new batch: allocates a list of items to a single haribhakt in one
 * go. If eventId is omitted, the currently active festival year is used.
 */
public record BulkAllocationRequest(
        Long eventId,
        @NotNull(message = "haribhaktId is required") Long haribhaktId,
        @NotEmpty(message = "itemIds must contain at least one item") List<Long> itemIds,
        Integer quantity,
        String notes
) {
}
