package com.annakut.planner.repository;

import com.annakut.planner.domain.Item;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ItemRepository extends JpaRepository<Item, Long> {
    List<Item> findByActiveTrueOrderByCategoryAscNameAsc();

    List<Item> findAllByOrderByCategoryAscNameAsc();
}
