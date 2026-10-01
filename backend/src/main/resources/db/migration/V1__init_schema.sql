-- Annakut Items Planner - initial schema
-- Dedicated schema (kept separate from "public") so this app's tables never collide
-- with other applications sharing the same PostgreSQL instance.
CREATE SCHEMA IF NOT EXISTS annakut;

-- Application users (login accounts). Role drives what menus/actions are available.
CREATE TABLE annakut.users (
    id             BIGSERIAL PRIMARY KEY,
    username       VARCHAR(50)  NOT NULL UNIQUE,
    password_hash  VARCHAR(255) NOT NULL,
    full_name      VARCHAR(150) NOT NULL,
    role           VARCHAR(20)  NOT NULL CHECK (role IN ('ADMIN', 'VOLUNTEER')),
    enabled        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMP    NOT NULL DEFAULT now()
);

-- Master catalog of Annakut items/dishes. This list is year-independent so it is
-- built up once and reused every year (admins add/retire items as the menu evolves).
CREATE TABLE annakut.items (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    category    VARCHAR(100) NOT NULL,
    bowl_count  INTEGER      NOT NULL DEFAULT 1,
    note        VARCHAR(500),
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP    NOT NULL DEFAULT now(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT now()
);
CREATE INDEX idx_items_category ON annakut.items (category);
CREATE INDEX idx_items_active ON annakut.items (active);

-- Haribhakt (devotee) master data. Independent of year - the same person can be
-- allocated items across multiple festival years.
CREATE TABLE annakut.haribhakts (
    id             BIGSERIAL PRIMARY KEY,
    name           VARCHAR(150) NOT NULL,
    mobile_number  VARCHAR(20),
    address        VARCHAR(500),
    notes          VARCHAR(500),
    created_at     TIMESTAMP    NOT NULL DEFAULT now(),
    updated_at     TIMESTAMP    NOT NULL DEFAULT now()
);
CREATE INDEX idx_haribhakts_name ON annakut.haribhakts (name);

-- One row per festival year (e.g. 2026, 2027, ...). Allocations are always scoped
-- to an event so every year's planning is kept separate and historical data is preserved.
CREATE TABLE annakut.festival_events (
    id          BIGSERIAL PRIMARY KEY,
    year        INTEGER      NOT NULL UNIQUE,
    name        VARCHAR(255) NOT NULL,
    location    VARCHAR(255),
    is_active   BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP    NOT NULL DEFAULT now()
);

-- A batch groups the whole list of items allocated to one haribhakt, for one
-- festival year, under a single batch number. Collection is tracked once per
-- batch (status) rather than per item - allocating/collecting a batch applies
-- to every item inside it at the same time. allocated_date is only stamped
-- once the batch is actually moved to ALLOCATED (or later), not at creation.
CREATE TABLE annakut.allocation_batches (
    id              BIGSERIAL PRIMARY KEY,
    event_id        BIGINT    NOT NULL REFERENCES annakut.festival_events (id) ON DELETE CASCADE,
    haribhakt_id    BIGINT    NOT NULL REFERENCES annakut.haribhakts (id) ON DELETE CASCADE,
    batch_number    INTEGER   NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ALLOCATED', 'COLLECTED')),
    allocated_date  TIMESTAMP,
    notes           VARCHAR(500),
    created_at      TIMESTAMP NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uq_batch_event_number UNIQUE (event_id, batch_number)
);
CREATE INDEX idx_allocation_batches_haribhakt ON annakut.allocation_batches (haribhakt_id);
CREATE INDEX idx_allocation_batches_event ON annakut.allocation_batches (event_id);

-- The individual items inside a batch. An item can only belong to one batch
-- per festival year (enforced in the service layer across all of an event's batches).
CREATE TABLE annakut.allocation_items (
    id          BIGSERIAL PRIMARY KEY,
    batch_id    BIGINT  NOT NULL REFERENCES annakut.allocation_batches (id) ON DELETE CASCADE,
    item_id     BIGINT  NOT NULL REFERENCES annakut.items (id) ON DELETE CASCADE,
    quantity    INTEGER NOT NULL DEFAULT 1,
    notes       VARCHAR(500),
    created_at  TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uq_batch_item UNIQUE (batch_id, item_id)
);
CREATE INDEX idx_allocation_items_batch ON annakut.allocation_items (batch_id);
CREATE INDEX idx_allocation_items_item ON annakut.allocation_items (item_id);
