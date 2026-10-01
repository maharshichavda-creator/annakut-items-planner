package com.annakut.planner.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

/** Adds more items to an existing (not yet collected) batch. */
public record AddBatchItemsRequest(
        @NotEmpty(message = "itemIds must contain at least one item") List<Long> itemIds,
        Integer quantity
) {
}
