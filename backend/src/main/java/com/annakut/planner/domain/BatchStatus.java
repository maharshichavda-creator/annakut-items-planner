package com.annakut.planner.domain;

/**
 * Lifecycle of an entire allocation batch. All items in a batch move through
 * these states together: a batch is created directly as ALLOCATED for a haribhakt (which stamps
 * the allocated date and user), and
 * finally the whole batch is handed over and marked collected on the day of
 * the festival (COLLECTED).
 */
public enum BatchStatus {
    ALLOCATED,
    COLLECTED
}
