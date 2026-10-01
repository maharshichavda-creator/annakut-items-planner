package com.annakut.planner.repository;

import com.annakut.planner.domain.AllocationBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AllocationBatchRepository extends JpaRepository<AllocationBatch, Long> {

    List<AllocationBatch> findByEventIdOrderByBatchNumberAsc(Long eventId);

    List<AllocationBatch> findByEventIdAndHaribhaktIdOrderByBatchNumberAsc(Long eventId, Long haribhaktId);

    boolean existsByHaribhaktId(Long haribhaktId);

    @Query("select coalesce(max(b.batchNumber), 0) from AllocationBatch b where b.event.id = :eventId")
    Integer findMaxBatchNumberForEvent(@Param("eventId") Long eventId);

    Optional<AllocationBatch> findByEventIdAndBatchNumber(Long eventId, Integer batchNumber);
}
