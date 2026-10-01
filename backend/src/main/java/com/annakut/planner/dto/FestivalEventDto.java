package com.annakut.planner.dto;

import com.annakut.planner.domain.FestivalEvent;

import java.time.Instant;

public record FestivalEventDto(
        Long id,
        Integer year,
        String name,
        String location,
        boolean active,
        Instant createdAt
) {
    public static FestivalEventDto from(FestivalEvent e) {
        return new FestivalEventDto(e.getId(), e.getYear(), e.getName(), e.getLocation(), e.isActive(), e.getCreatedAt());
    }
}
