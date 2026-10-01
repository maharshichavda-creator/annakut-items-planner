package com.annakut.planner.repository;

import com.annakut.planner.domain.AllocationItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AllocationItemRepository extends JpaRepository<AllocationItem, Long> {

    List<AllocationItem> findByItemId(Long itemId);

    @Query("select ai from AllocationItem ai where ai.batch.event.id = :eventId and ai.item.id = :itemId")
    List<AllocationItem> findByEventIdAndItemId(@Param("eventId") Long eventId, @Param("itemId") Long itemId);

    boolean existsByBatchIdAndItemId(Long batchId, Long itemId);
}
