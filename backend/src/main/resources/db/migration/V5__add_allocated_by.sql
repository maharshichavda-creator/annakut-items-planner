-- Records which user clicked Allocate on a batch (NULL until then).
ALTER TABLE annakut.allocation_batches ADD COLUMN allocated_by VARCHAR(150);
