package com.annakut.planner.web;

import com.annakut.planner.dto.HaribhaktDto;
import com.annakut.planner.dto.HaribhaktRequest;
import com.annakut.planner.service.HaribhaktService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/haribhakts")
public class HaribhaktController {

    private final HaribhaktService haribhaktService;

    public HaribhaktController(HaribhaktService haribhaktService) {
        this.haribhaktService = haribhaktService;
    }

    @GetMapping
    public List<HaribhaktDto> list() {
        return haribhaktService.listAll();
    }

    @GetMapping("/{id}")
    public HaribhaktDto get(@PathVariable Long id) {
        return haribhaktService.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public HaribhaktDto create(@Valid @RequestBody HaribhaktRequest request) {
        return haribhaktService.create(request);
    }

    @PutMapping("/{id}")
    public HaribhaktDto update(@PathVariable Long id, @Valid @RequestBody HaribhaktRequest request) {
        return haribhaktService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        haribhaktService.delete(id);
    }
}
