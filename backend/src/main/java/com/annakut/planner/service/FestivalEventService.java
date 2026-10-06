package com.annakut.planner.service;

import com.annakut.planner.domain.FestivalEvent;
import com.annakut.planner.dto.FestivalEventDto;
import com.annakut.planner.dto.FestivalEventRequest;
import com.annakut.planner.exception.ConflictException;
import com.annakut.planner.exception.ResourceNotFoundException;
import com.annakut.planner.repository.FestivalEventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class FestivalEventService {

    private final FestivalEventRepository festivalEventRepository;

    public FestivalEventService(FestivalEventRepository festivalEventRepository) {
        this.festivalEventRepository = festivalEventRepository;
    }

    @Transactional(readOnly = true)
    public List<FestivalEventDto> listAll() {
        return festivalEventRepository.findAllByOrderByYearDesc().stream().map(FestivalEventDto::from).toList();
    }

    @Transactional(readOnly = true)
    public FestivalEventDto getActive() {
        return festivalEventRepository.findByActiveTrue()
                .map(FestivalEventDto::from)
                .orElseThrow(() -> new ResourceNotFoundException("No active festival year configured"));
    }

    public FestivalEventDto create(FestivalEventRequest request) {
        if (festivalEventRepository.existsByYear(request.year())) {
            throw new ConflictException("A festival year " + request.year() + " already exists");
        }
        FestivalEvent event = new FestivalEvent();
        event.setYear(request.year());
        event.setName(request.name().trim());
        event.setLocation(request.location());
        event.setAnnakutDate(request.annakutDate());
        FestivalEvent saved = festivalEventRepository.save(event);
        if (Boolean.TRUE.equals(request.active())) {
            activate(saved.getId());
            return FestivalEventDto.from(festivalEventRepository.findById(saved.getId()).orElseThrow());
        }
        return FestivalEventDto.from(saved);
    }

    public FestivalEventDto activate(Long id) {
        FestivalEvent event = festivalEventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Festival year not found: " + id));

        // Only one festival year can be active (current) at a time.
        festivalEventRepository.findByActiveTrue().ifPresent(current -> {
            if (!current.getId().equals(id)) {
                current.setActive(false);
                festivalEventRepository.save(current);
            }
        });
        event.setActive(true);
        return FestivalEventDto.from(festivalEventRepository.save(event));
    }

    /**
     * Deactivates a festival year without activating a replacement, leaving
     * the app with no active year until one is explicitly activated again.
     */
    public FestivalEventDto deactivate(Long id) {
        FestivalEvent event = festivalEventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Festival year not found: " + id));
        event.setActive(false);
        return FestivalEventDto.from(festivalEventRepository.save(event));
    }
}
