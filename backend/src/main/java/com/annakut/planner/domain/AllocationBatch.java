package com.annakut.planner.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * A numbered batch of items allocated together to one haribhakt, for one
 * festival year. Collection status lives here (not on individual items) so
 * marking a batch collected updates every item in it at once.
 */
@Entity
@Table(name = "allocation_batches", uniqueConstraints = @UniqueConstraint(columnNames = {"event_id", "batch_number"}))
public class AllocationBatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private FestivalEvent event;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "haribhakt_id", nullable = false)
    private Haribhakt haribhakt;

    @Column(name = "batch_number", nullable = false)
    private Integer batchNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BatchStatus status = BatchStatus.ALLOCATED;

    @Column(name = "allocated_date")
    private Instant allocatedDate;

    @Column(name = "allocated_by", length = 150)
    private String allocatedBy;

    private String notes;

    @OneToMany(mappedBy = "batch", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<AllocationItem> items = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public FestivalEvent getEvent() {
        return event;
    }

    public void setEvent(FestivalEvent event) {
        this.event = event;
    }

    public Haribhakt getHaribhakt() {
        return haribhakt;
    }

    public void setHaribhakt(Haribhakt haribhakt) {
        this.haribhakt = haribhakt;
    }

    public Integer getBatchNumber() {
        return batchNumber;
    }

    public void setBatchNumber(Integer batchNumber) {
        this.batchNumber = batchNumber;
    }

    public BatchStatus getStatus() {
        return status;
    }

    public void setStatus(BatchStatus status) {
        this.status = status;
    }

    public Instant getAllocatedDate() {
        return allocatedDate;
    }

    public void setAllocatedDate(Instant allocatedDate) {
        this.allocatedDate = allocatedDate;
    }

    public String getAllocatedBy() {
        return allocatedBy;
    }

    public void setAllocatedBy(String allocatedBy) {
        this.allocatedBy = allocatedBy;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<AllocationItem> getItems() {
        return items;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
