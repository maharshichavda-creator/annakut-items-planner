-- Batches are now created directly as ALLOCATED; promote any leftover PENDING batches.
UPDATE annakut.allocation_batches
SET status = 'ALLOCATED',
    allocated_date = COALESCE(allocated_date, created_at)
WHERE status = 'PENDING';

ALTER TABLE annakut.allocation_batches ALTER COLUMN status SET DEFAULT 'ALLOCATED';
