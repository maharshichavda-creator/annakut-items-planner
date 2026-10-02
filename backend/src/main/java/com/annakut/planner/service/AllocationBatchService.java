package com.annakut.planner.service;

import com.annakut.planner.domain.*;
import com.annakut.planner.dto.AddBatchItemsRequest;
import com.annakut.planner.dto.AllocationBatchDto;
import com.annakut.planner.dto.BatchStatusUpdateRequest;
import com.annakut.planner.dto.BulkAllocationRequest;
import com.annakut.planner.exception.ConflictException;
import com.annakut.planner.exception.ResourceNotFoundException;
import com.annakut.planner.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@Transactional
public class AllocationBatchService {

    private final AllocationBatchRepository batchRepository;
    private final AllocationItemRepository itemAllocationRepository;
    private final ItemRepository itemRepository;
    private final HaribhaktRepository haribhaktRepository;
    private final FestivalEventRepository festivalEventRepository;
    private final UserRepository userRepository;

    public AllocationBatchService(AllocationBatchRepository batchRepository,
                                   AllocationItemRepository itemAllocationRepository,
                                   ItemRepository itemRepository,
                                   HaribhaktRepository haribhaktRepository,
                                   FestivalEventRepository festivalEventRepository,
                                   UserRepository userRepository) {
        this.batchRepository = batchRepository;
        this.itemAllocationRepository = itemAllocationRepository;
        this.itemRepository = itemRepository;
        this.haribhaktRepository = haribhaktRepository;
        this.festivalEventRepository = festivalEventRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<AllocationBatchDto> listByEvent(Long eventId) {
        Long resolvedEventId = eventId != null ? eventId : resolveActiveEvent().getId();
        return batchRepository.findByEventIdOrderByBatchNumberAsc(resolvedEventId)
                .stream().map(AllocationBatchDto::from).toList();
    }

    @Transactional(readOnly = true)
    public List<AllocationBatchDto> listByHaribhakt(Long eventId, Long haribhaktId) {
        Long resolvedEventId = eventId != null ? eventId : resolveActiveEvent().getId();
        return batchRepository.findByEventIdAndHaribhaktIdOrderByBatchNumberAsc(resolvedEventId, haribhaktId)
                .stream().map(AllocationBatchDto::from).toList();
    }

    @Transactional(readOnly = true)
    public AllocationBatchDto get(Long id) {
        return AllocationBatchDto.from(findBatch(id));
    }

    /**
     * Creates a new numbered batch, allocating the whole list of items to one
     * haribhakt in a single transaction. An item already sitting in another
     * batch for the same festival year is rejected.
     */
    public AllocationBatchDto createBatch(BulkAllocationRequest request) {
        FestivalEvent event = request.eventId() != null ? findEvent(request.eventId()) : resolveActiveEvent();
        Haribhakt haribhakt = haribhaktRepository.findById(request.haribhaktId())
                .orElseThrow(() -> new ResourceNotFoundException("Haribhakt not found: " + request.haribhaktId()));

        AllocationBatch batch = new AllocationBatch();
        batch.setEvent(event);
        batch.setHaribhakt(haribhakt);
        batch.setBatchNumber(nextBatchNumber(event.getId()));
        batch.setNotes(request.notes());

        int quantity = request.quantity() == null ? 1 : request.quantity();
        for (Long itemId : request.itemIds()) {
            batch.getItems().add(buildAllocationItem(event.getId(), batch, itemId, quantity));
        }

        return AllocationBatchDto.from(batchRepository.save(batch));
    }

    /** Adds further items to an existing batch that has not yet been collected. */
    public AllocationBatchDto addItems(Long batchId, AddBatchItemsRequest request) {
        AllocationBatch batch = findBatch(batchId);
        if (batch.getStatus() == BatchStatus.COLLECTED) {
            throw new ConflictException("Batch #" + batch.getBatchNumber() + " is already collected and cannot be changed");
        }
        int quantity = request.quantity() == null ? 1 : request.quantity();
        for (Long itemId : request.itemIds()) {
            batch.getItems().add(buildAllocationItem(batch.getEvent().getId(), batch, itemId, quantity));
        }
        return AllocationBatchDto.from(batchRepository.save(batch));
    }

    /** Removes a single item from a batch that has not yet been collected. */
    public AllocationBatchDto removeItem(Long batchId, Long itemId) {
        AllocationBatch batch = findBatch(batchId);
        if (batch.getStatus() == BatchStatus.COLLECTED) {
            throw new ConflictException("Batch #" + batch.getBatchNumber() + " is already collected and cannot be changed");
        }
        boolean removed = batch.getItems().removeIf(ai -> ai.getItem().getId().equals(itemId));
        if (!removed) {
            throw new ResourceNotFoundException("Item " + itemId + " is not part of batch " + batchId);
        }
        return AllocationBatchDto.from(batchRepository.save(batch));
    }

    /**
     * Updates the status of the whole batch (e.g. ALLOCATED or COLLECTED).
     * Every item inside the batch is considered to share this status. The
     * allocated date is stamped the first time the batch leaves PENDING, and
     * the acting user is recorded only when the batch is moved to ALLOCATED.
     */
    public AllocationBatchDto updateStatus(Long id, BatchStatusUpdateRequest request, String username) {
        AllocationBatch batch = findBatch(id);
        batch.setStatus(request.status());
        if (request.status() != BatchStatus.PENDING && batch.getAllocatedDate() == null) {
            batch.setAllocatedDate(Instant.now());
        }
        if (request.status() == BatchStatus.ALLOCATED) {
            batch.setAllocatedBy(userRepository.findByUsername(username)
                    .map(User::getFullName)
                    .orElse(username));
        }
        if (request.notes() != null) {
            batch.setNotes(request.notes());
        }
        return AllocationBatchDto.from(batchRepository.save(batch));
    }

    /** Cancels/deletes an entire batch, freeing all of its items back up for reallocation. */
    public void deleteBatch(Long id) {
        AllocationBatch batch = findBatch(id);
        batchRepository.delete(batch);
    }

    private AllocationItem buildAllocationItem(Long eventId, AllocationBatch batch, Long itemId, int quantity) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found: " + itemId));

        if (!itemAllocationRepository.findByEventIdAndItemId(eventId, itemId).isEmpty()) {
            throw new ConflictException("Item '" + item.getName() + "' is already allocated in another batch for this year");
        }

        AllocationItem allocationItem = new AllocationItem();
        allocationItem.setBatch(batch);
        allocationItem.setItem(item);
        allocationItem.setQuantity(quantity);
        return allocationItem;
    }

    private int nextBatchNumber(Long eventId) {
        Integer max = batchRepository.findMaxBatchNumberForEvent(eventId);
        return (max == null ? 0 : max) + 1;
    }

    private AllocationBatch findBatch(Long id) {
        return batchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Allocation batch not found: " + id));
    }

    private FestivalEvent resolveActiveEvent() {
        return festivalEventRepository.findByActiveTrue()
                .orElseThrow(() -> new ResourceNotFoundException("No active festival year configured"));
    }

    private FestivalEvent findEvent(Long id) {
        return festivalEventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Festival year not found: " + id));
    }
}
