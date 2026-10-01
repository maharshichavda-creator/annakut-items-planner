package com.annakut.planner.dto;

import com.annakut.planner.domain.Item;

import java.time.Instant;

public record ItemDto(
        Long id,
        String name,
        String category,
        Integer bowlCount,
        String note,
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {
    public static ItemDto from(Item item) {
        return new ItemDto(item.getId(), item.getName(), item.getCategory(), item.getBowlCount(),
                item.getNote(), item.isActive(), item.getCreatedAt(), item.getUpdatedAt());
    }
}
