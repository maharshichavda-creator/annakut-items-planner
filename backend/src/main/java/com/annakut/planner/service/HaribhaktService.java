package com.annakut.planner.service;

import com.annakut.planner.domain.Haribhakt;
import com.annakut.planner.dto.HaribhaktDto;
import com.annakut.planner.dto.HaribhaktRequest;
import com.annakut.planner.exception.ConflictException;
import com.annakut.planner.exception.ResourceNotFoundException;
import com.annakut.planner.repository.AllocationBatchRepository;
import com.annakut.planner.repository.HaribhaktRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class HaribhaktService {

    private final HaribhaktRepository haribhaktRepository;
    private final AllocationBatchRepository allocationBatchRepository;

    public HaribhaktService(HaribhaktRepository haribhaktRepository, AllocationBatchRepository allocationBatchRepository) {
        this.haribhaktRepository = haribhaktRepository;
        this.allocationBatchRepository = allocationBatchRepository;
    }

    @Transactional(readOnly = true)
    public List<HaribhaktDto> listAll() {
        return haribhaktRepository.findAllByOrderByNameAsc().stream().map(HaribhaktDto::from).toList();
    }

    @Transactional(readOnly = true)
    public HaribhaktDto get(Long id) {
        return HaribhaktDto.from(findEntity(id));
    }

    public HaribhaktDto create(HaribhaktRequest request) {
        Haribhakt h = new Haribhakt();
        apply(h, request);
        return HaribhaktDto.from(haribhaktRepository.save(h));
    }

    public HaribhaktDto update(Long id, HaribhaktRequest request) {
        Haribhakt h = findEntity(id);
        apply(h, request);
        return HaribhaktDto.from(haribhaktRepository.save(h));
    }

    public void delete(Long id) {
        Haribhakt h = findEntity(id);
        if (allocationBatchRepository.existsByHaribhaktId(id)) {
            throw new ConflictException("Cannot delete haribhakt with existing allocation batches. Remove their batches first.");
        }
        haribhaktRepository.delete(h);
    }

    private void apply(Haribhakt h, HaribhaktRequest request) {
        h.setName(request.name().trim());
        h.setMobileNumber(request.mobileNumber());
        h.setAddress(request.address());
        h.setNotes(request.notes());
    }

    private Haribhakt findEntity(Long id) {
        return haribhaktRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Haribhakt not found: " + id));
    }
}
