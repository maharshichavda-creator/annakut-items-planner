package com.annakut.planner.dto;

import com.annakut.planner.domain.Haribhakt;

import java.time.Instant;

public record HaribhaktDto(
        Long id,
        String name,
        String mobileNumber,
        String address,
        String notes,
        Instant createdAt,
        Instant updatedAt
) {
    public static HaribhaktDto from(Haribhakt h) {
        return new HaribhaktDto(h.getId(), h.getName(), h.getMobileNumber(), h.getAddress(), h.getNotes(),
                h.getCreatedAt(), h.getUpdatedAt());
    }
}
