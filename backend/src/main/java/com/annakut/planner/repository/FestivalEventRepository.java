package com.annakut.planner.repository;

import com.annakut.planner.domain.FestivalEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FestivalEventRepository extends JpaRepository<FestivalEvent, Long> {
    Optional<FestivalEvent> findByYear(Integer year);

    Optional<FestivalEvent> findByActiveTrue();

    List<FestivalEvent> findAllByOrderByYearDesc();

    boolean existsByYear(Integer year);
}
