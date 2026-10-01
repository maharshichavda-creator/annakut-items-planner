package com.annakut.planner.dto;

import com.annakut.planner.domain.AllocationItem;

public record BatchItemDto(
        Long id,
        Long itemId,
        String itemName,
        String itemCategory,
        Integer quantity,
        String notes
) {
    public static BatchItemDto from(AllocationItem ai) {
        return new BatchItemDto(ai.getId(), ai.getItem().getId(), ai.getItem().getName(),
                ai.getItem().getCategory(), ai.getQuantity(), ai.getNotes());
    }
}
