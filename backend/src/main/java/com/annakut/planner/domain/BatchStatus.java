package com.annakut.planner.domain;

/**
 * Lifecycle of an entire allocation batch. All items in a batch move through
 * these states together: a batch is first created for a haribhakt (PENDING),
 * then allocated to them (ALLOCATED, which stamps the allocated date), and
 * finally the whole batch is handed over and marked collected on the day of
 * the festival (COLLECTED).
 */
public enum BatchStatus {
    PENDING,
    ALLOCATED,
    COLLECTED
}
