package com.annakut.planner.dto;

import com.annakut.planner.domain.AllocationBatch;
import com.annakut.planner.domain.BatchStatus;

import java.time.Instant;
import java.util.List;

public record AllocationBatchDto(
        Long id,
        Long eventId,
        Integer eventYear,
        Long haribhaktId,
        String haribhaktName,
        String haribhaktMobile,
        Integer batchNumber,
        BatchStatus status,
        Instant allocatedDate,
        String notes,
        List<BatchItemDto> items
) {
    public static AllocationBatchDto from(AllocationBatch b) {
        return new AllocationBatchDto(
                b.getId(),
                b.getEvent().getId(),
                b.getEvent().getYear(),
                b.getHaribhakt().getId(),
                b.getHaribhakt().getName(),
                b.getHaribhakt().getMobileNumber(),
                b.getBatchNumber(),
                b.getStatus(),
                b.getAllocatedDate(),
                b.getNotes(),
                b.getItems().stream().map(BatchItemDto::from).toList()
        );
    }
}
