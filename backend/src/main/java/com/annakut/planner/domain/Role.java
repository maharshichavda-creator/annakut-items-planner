package com.annakut.planner.domain;

/**
 * Application role. ADMIN has full access; VOLUNTEER can manage haribhakts
 * and allocations but cannot add/delete items or manage users.
 */
public enum Role {
    ADMIN,
    VOLUNTEER
}
