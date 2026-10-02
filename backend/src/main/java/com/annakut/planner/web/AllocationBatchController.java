package com.annakut.planner.web;

import com.annakut.planner.dto.AddBatchItemsRequest;
import com.annakut.planner.dto.AllocationBatchDto;
import com.annakut.planner.dto.BatchStatusUpdateRequest;
import com.annakut.planner.dto.BulkAllocationRequest;
import com.annakut.planner.service.AllocationBatchService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/allocation-batches")
public class AllocationBatchController {

    private final AllocationBatchService allocationBatchService;

    public AllocationBatchController(AllocationBatchService allocationBatchService) {
        this.allocationBatchService = allocationBatchService;
    }

    @GetMapping
    public List<AllocationBatchDto> list(@RequestParam(required = false) Long eventId,
                                          @RequestParam(required = false) Long haribhaktId) {
        if (haribhaktId != null) {
            return allocationBatchService.listByHaribhakt(eventId, haribhaktId);
        }
        return allocationBatchService.listByEvent(eventId);
    }

    @GetMapping("/{id}")
    public AllocationBatchDto get(@PathVariable Long id) {
        return allocationBatchService.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AllocationBatchDto create(@Valid @RequestBody BulkAllocationRequest request) {
        return allocationBatchService.createBatch(request);
    }

    @PostMapping("/{id}/items")
    public AllocationBatchDto addItems(@PathVariable Long id, @Valid @RequestBody AddBatchItemsRequest request) {
        return allocationBatchService.addItems(id, request);
    }

    @DeleteMapping("/{id}/items/{itemId}")
    public AllocationBatchDto removeItem(@PathVariable Long id, @PathVariable Long itemId) {
        return allocationBatchService.removeItem(id, itemId);
    }

    @PatchMapping("/{id}/status")
    public AllocationBatchDto updateStatus(@PathVariable Long id, @Valid @RequestBody BatchStatusUpdateRequest request,
                                           Authentication authentication) {
        return allocationBatchService.updateStatus(id, request, authentication.getName());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        allocationBatchService.deleteBatch(id);
    }
}
