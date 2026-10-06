package com.annakut.planner.dto;

import com.annakut.planner.domain.FestivalEvent;

import java.time.Instant;
import java.time.LocalDate;

public record FestivalEventDto(
        Long id,
        Integer year,
        String name,
        String location,
        LocalDate annakutDate,
        boolean active,
        Instant createdAt
) {
    public static FestivalEventDto from(FestivalEvent e) {
        return new FestivalEventDto(e.getId(), e.getYear(), e.getName(), e.getLocation(), e.getAnnakutDate(),
                e.isActive(), e.getCreatedAt());
    }
}
