package com.annakut.planner.service;

import com.annakut.planner.domain.Item;
import com.annakut.planner.dto.ItemDto;
import com.annakut.planner.dto.ItemRequest;
import com.annakut.planner.exception.ResourceNotFoundException;
import com.annakut.planner.repository.AllocationItemRepository;
import com.annakut.planner.repository.ItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ItemService {

    private final ItemRepository itemRepository;
    private final AllocationItemRepository allocationItemRepository;

    public ItemService(ItemRepository itemRepository, AllocationItemRepository allocationItemRepository) {
        this.itemRepository = itemRepository;
        this.allocationItemRepository = allocationItemRepository;
    }

    @Transactional(readOnly = true)
    public List<ItemDto> listAll(boolean activeOnly) {
        List<Item> items = activeOnly
                ? itemRepository.findByActiveTrueOrderByCategoryAscNameAsc()
                : itemRepository.findAllByOrderByCategoryAscNameAsc();
        return items.stream().map(ItemDto::from).toList();
    }

    @Transactional(readOnly = true)
    public ItemDto get(Long id) {
        return ItemDto.from(findEntity(id));
    }

    public ItemDto create(ItemRequest request) {
        Item item = new Item();
        apply(item, request);
        return ItemDto.from(itemRepository.save(item));
    }

    public ItemDto update(Long id, ItemRequest request) {
        Item item = findEntity(id);
        apply(item, request);
        return ItemDto.from(itemRepository.save(item));
    }

    public void delete(Long id) {
        Item item = findEntity(id);
        // Permanent delete: allocations referencing the item are removed with it.
        allocationItemRepository.deleteAll(allocationItemRepository.findByItemId(id));
        itemRepository.delete(item);
    }

    private void apply(Item item, ItemRequest request) {
        item.setName(request.name().trim());
        item.setCategory(request.category().trim());
        item.setBowlCount(request.bowlCount() == null ? 1 : request.bowlCount());
        item.setNote(request.note());
        if (request.active() != null) {
            item.setActive(request.active());
        }
    }

    private Item findEntity(Long id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found: " + id));
    }
}
