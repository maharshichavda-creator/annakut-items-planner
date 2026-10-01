package com.annakut.planner.repository;

import com.annakut.planner.domain.Haribhakt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HaribhaktRepository extends JpaRepository<Haribhakt, Long> {
    List<Haribhakt> findAllByOrderByNameAsc();
}
