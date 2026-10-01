package com.annakut.planner.web;

import com.annakut.planner.dto.FestivalEventDto;
import com.annakut.planner.dto.FestivalEventRequest;
import com.annakut.planner.service.FestivalEventService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/festival-events")
public class FestivalEventController {

    private final FestivalEventService festivalEventService;

    public FestivalEventController(FestivalEventService festivalEventService) {
        this.festivalEventService = festivalEventService;
    }

    @GetMapping
    public List<FestivalEventDto> list() {
        return festivalEventService.listAll();
    }

    @GetMapping("/active")
    public FestivalEventDto getActive() {
        return festivalEventService.getActive();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FestivalEventDto create(@Valid @RequestBody FestivalEventRequest request) {
        return festivalEventService.create(request);
    }

    @PostMapping("/{id}/activate")
    public FestivalEventDto activate(@PathVariable Long id) {
        return festivalEventService.activate(id);
    }

    @PostMapping("/{id}/deactivate")
    public FestivalEventDto deactivate(@PathVariable Long id) {
        return festivalEventService.deactivate(id);
    }
}
