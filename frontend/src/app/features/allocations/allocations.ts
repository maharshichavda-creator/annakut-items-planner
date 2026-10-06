import { Component, DestroyRef, OnInit, TemplateRef, ViewChild, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EMPTY, catchError, exhaustMap, filter, forkJoin, fromEvent, interval, merge, of } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Capacitor } from '@capacitor/core';
import { AppLauncher } from '@capacitor/app-launcher';
import { AuthService } from '../../core/auth.service';
import { AllocationBatch, BatchStatus, FestivalEvent, Haribhakt, Item } from '../../core/models';
import { ItemService } from '../items/item.service';
import { HaribhaktService } from '../haribhakts/haribhakt.service';
import { FestivalEventService } from '../festival-events/festival-event.service';
import { HaribhaktSelect } from '../../shared/haribhakt-select/haribhakt-select';
import { AllocationBatchService } from './allocation-batch.service';

@Component({
  selector: 'app-allocations',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDialogModule,
    HaribhaktSelect,
  ],
  templateUrl: './allocations.html',
  styleUrl: './allocations.scss',
})
export class Allocations implements OnInit {
  private destroyRef = inject(DestroyRef);
  events = signal<FestivalEvent[]>([]);
  selectedEventId = signal<number | null>(null);
  haribhakts = signal<Haribhakt[]>([]);
  activeItems = signal<Item[]>([]);
  batches = signal<AllocationBatch[]>([]);

  // New batch form state
  newBatchHaribhaktId: number | null = null;
  itemFilterText = signal('');
  refreshing = signal(false);
  selectedItemIds = signal<Set<number>>(new Set());

  // Add-to-existing-batch state
  addingToBatchId = signal<number | null>(null);
  additionSelectedIds = signal<Set<number>>(new Set());

  filterHaribhaktId = signal<number | null>(null);
  filterStatus = signal<BatchStatus | null>(null);
  expandedBatchId = signal<number | null>(null);

  @ViewChild('batchDialog') batchDialog!: TemplateRef<unknown>;

  expandedBatch = computed(() => this.batches().find((b) => b.id === this.expandedBatchId()) ?? null);

  batchColumns = ['haribhakt', 'itemCount', 'status', 'allocatedDate', 'allocatedBy', 'actions'];

  allocatedItemIds = computed(() => {
    const ids = new Set<number>();
    for (const batch of this.batches()) {
      for (const item of batch.items) {
        ids.add(item.itemId);
      }
    }
    return ids;
  });

  availableItems = computed(() => this.activeItems().filter((item) => !this.allocatedItemIds().has(item.id)));

  filteredAvailableItems = computed(() => {
    const filterText = this.itemFilterText().trim().toLowerCase();
    const items = this.availableItems();
    if (!filterText) {
      return items;
    }
    return items.filter(
      (item) => item.name.toLowerCase().includes(filterText) || item.category.toLowerCase().includes(filterText)
    );
  });

  visibleBatches = computed(() => {
    const haribhaktId = this.filterHaribhaktId();
    const status = this.filterStatus();
    let batches = this.batches();
    if (haribhaktId) {
      batches = batches.filter((b) => b.haribhaktId === haribhaktId);
    }
    if (status) {
      batches = batches.filter((b) => b.status === status);
    }
    return [...batches].sort(
      (a, b) =>
        a.haribhaktName.localeCompare(b.haribhaktName, undefined, { sensitivity: 'base' }) ||
        a.batchNumber - b.batchNumber,
    );
  });

  // Mutating actions (create/allocate/collect/etc.) are only allowed while the
  // festival year selected here is the one currently marked active on the
  // Festival Years screen. Past years are shown read-only.
  isActiveYearSelected = computed(() => {
    const selectedId = this.selectedEventId();
    return this.events().some((e) => e.id === selectedId && e.active);
  });

  // Items can only be collected on the Annakut date configured for the selected year.
  isAnnakutToday = computed(() => {
    const selectedId = this.selectedEventId();
    const event = this.events().find((e) => e.id === selectedId);
    if (!event?.annakutDate) {
      return false;
    }
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return event.annakutDate === today;
  });

  // Summary widgets shown at the top of the page for the selected year.
  totalItemsCount = computed(() => this.activeItems().length);

  // "Pending" means not yet placed into any batch at all (still sitting in
  // the available/unallocated pool), not a batch whose status happens to be
  // PENDING.
  pendingItemsCount = computed(() => this.availableItems().length);

  allocatedItemsCount = computed(() => this.countItemsWithStatus('ALLOCATED'));

  collectedItemsCount = computed(() => this.countItemsWithStatus('COLLECTED'));

  allocatedHaribhaktCount = computed(() => new Set(this.batches().map((b) => b.haribhaktId)).size);

  private countItemsWithStatus(status: BatchStatus): number {
    return this.batches()
      .filter((b) => b.status === status)
      .reduce((sum, b) => sum + b.items.length, 0);
  }

  constructor(
    public auth: AuthService,
    private itemService: ItemService,
    private haribhaktService: HaribhaktService,
    private festivalEventService: FestivalEventService,
    private allocationBatchService: AllocationBatchService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.festivalEventService.list().subscribe((events) => {
      this.events.set(events);
      const active = events.find((e) => e.active) ?? events[0] ?? null;
      if (active) {
        this.selectedEventId.set(active.id);
        this.loadEventData();
      }
    });
    this.haribhaktService.list().subscribe((list) => this.haribhakts.set(list));
    this.startAutoRefresh();
  }

  // Pick up changes made from other devices. Batches (what changes on every allocation) are polled every few
  // seconds; the larger reference lists are refreshed less often. Both also refresh when the page regains focus.
  private startAutoRefresh(): void {
    const onReturn$ = merge(fromEvent(document, 'visibilitychange'), fromEvent(window, 'focus'));
    const canRefresh = () => !document.hidden && this.selectedEventId() !== null;

    merge(interval(5000), onReturn$)
      .pipe(
        filter(canRefresh),
        exhaustMap(() => this.allocationBatchService.list(this.selectedEventId()!).pipe(catchError(() => EMPTY))),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((batches) => {
        this.setIfChanged(this.batches, batches);
        this.dropUnavailableSelections();
      });

    merge(interval(60000), onReturn$)
      .pipe(
        filter(canRefresh),
        exhaustMap(() =>
          forkJoin({
            events: this.festivalEventService.list(),
            haribhakts: this.haribhaktService.list(),
            items: this.itemService.list(true),
          }).pipe(catchError(() => EMPTY))
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(({ events, haribhakts, items }) => {
        this.setIfChanged(this.events, events);
        this.setIfChanged(this.haribhakts, haribhakts);
        this.setIfChanged(this.activeItems, items);
        this.dropUnavailableSelections();
      });
  }
  private setIfChanged<T>(target: { (): T; set(value: T): void }, next: T): void {
    if (JSON.stringify(target()) !== JSON.stringify(next)) {
      target.set(next);
    }
  }

  // Items allocated elsewhere must not stay ticked in a pending selection.
  private dropUnavailableSelections(): void {
    const available = new Set(this.availableItems().map((i) => i.id));
    for (const selection of [this.selectedItemIds, this.additionSelectedIds]) {
      const current = selection();
      const kept = new Set([...current].filter((id) => available.has(id)));
      if (kept.size !== current.size) {
        selection.set(kept);
      }
    }
  }

  onEventChange(): void {    this.loadEventData();
  }

  refresh(): void {
    if (this.refreshing()) {
      return;
    }
    this.refreshing.set(true);
    const eventId = this.selectedEventId();
    forkJoin({
      events: this.festivalEventService.list(),
      haribhakts: this.haribhaktService.list(),
      items: this.itemService.list(true),
      batches: eventId ? this.allocationBatchService.list(eventId) : of(null),
    }).subscribe({
      next: ({ events, haribhakts, items, batches }) => {
        this.events.set(events);
        this.haribhakts.set(haribhakts);
        this.activeItems.set(items);
        if (batches) {
          this.batches.set(batches);
        }
        this.dropUnavailableSelections();
        this.refreshing.set(false);
        this.snackBar.open("Refreshed", "OK", { duration: 1500 });
      },
      error: () => {
        this.refreshing.set(false);
        this.snackBar.open("Refresh failed", "OK", { duration: 3000 });
      },
    });
  }

  loadEventData(): void {
    const eventId = this.selectedEventId();
    if (!eventId) {
      return;
    }
    forkJoin({
      items: this.itemService.list(true),
      batches: this.allocationBatchService.list(eventId),
    }).subscribe(({ items, batches }) => {
      this.activeItems.set(items);
      this.batches.set(batches);
    });
  }

  toggleItemSelection(itemId: number): void {
    const current = new Set(this.selectedItemIds());
    if (current.has(itemId)) {
      current.delete(itemId);
    } else {
      current.add(itemId);
    }
    this.selectedItemIds.set(current);
  }

  createBatch(): void {
    const eventId = this.selectedEventId();
    const itemIds = Array.from(this.selectedItemIds());
    if (!eventId || !this.newBatchHaribhaktId || itemIds.length === 0) {
      this.snackBar.open('Select a haribhakt and at least one item', 'OK', { duration: 3000 });
      return;
    }
    this.allocationBatchService
      .create({ eventId, haribhaktId: this.newBatchHaribhaktId, itemIds })
      .subscribe({
        next: (batch) => {
          this.snackBar.open(`Allocated ${itemIds.length} item(s)`, 'OK', {
            duration: 3000,
          });
          this.newBatchHaribhaktId = null;
          this.selectedItemIds.set(new Set());
          this.loadEventData();
        },
        error: (err) => this.snackBar.open(err?.error?.message ?? 'Failed to create batch', 'OK', { duration: 4000 }),
      });
  }

  openBatchDialog(batchId: number): void {
    this.expandedBatchId.set(batchId);
    this.addingToBatchId.set(null);
    this.dialog
      .open(this.batchDialog, { width: '520px', maxWidth: '95vw', autoFocus: false })
      .afterClosed()
      .subscribe(() => {
        this.expandedBatchId.set(null);
        this.addingToBatchId.set(null);
      });
  }

  updateStatus(batch: AllocationBatch, status: BatchStatus): void {
    this.allocationBatchService.updateStatus(batch.id, status).subscribe({
      next: () => {
        this.snackBar.open(`Items for ${batch.haribhaktName} marked ${this.statusLabel(status).toLowerCase()}`, 'OK', {
          duration: 2500,
        });
        this.loadEventData();
      },
      error: (err) => this.snackBar.open(err?.error?.message ?? 'Update failed', 'OK', { duration: 4000 }),
    });
  }

  sendWhatsApp(batch: AllocationBatch): void {
    const lines = batch.items.map((item, i) => `${i + 1}. ${item.itemName} (${item.itemCategory}) - ${item.quantity}`);
    const message =
      `Jay Swaminarayan ${batch.haribhaktName},\n\n` +
      `Annakut Mahotsav ${batch.eventYear} - items allocated to you:\n\n` +
      `${lines.join('\n')}\n\nThank you.\nBAPS Shri Swaminarayan Mandir, Pune.`;

    // wa.me needs digits only with country code; assume India (+91) for bare 10-digit numbers.
    let phone = (batch.haribhaktMobile ?? '').replace(/\D/g, '');
    if (phone.length === 11 && phone.startsWith('0')) {
      phone = phone.slice(1);
    }
    if (phone.length === 10) {
      phone = '91' + phone;
    }
    if (!phone) {
      this.snackBar.open('No mobile number saved - choose the contact in WhatsApp', 'OK', { duration: 3500 });
    }
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    if (Capacitor.isNativePlatform()) {
      // window.open does not leave the Android WebView; hand the link to the OS so WhatsApp opens.
      AppLauncher.openUrl({ url });
    } else {
      window.open(url, '_blank', 'noopener');
    }
  }
  statusLabel(status: BatchStatus): string {
    switch (status) {
      case 'ALLOCATED':
        return 'Allocated';
      case 'COLLECTED':
        return 'Collected';
    }
  }

  statusClass(status: BatchStatus): string {
    switch (status) {
      case 'ALLOCATED':
        return 'status-allocated';
      case 'COLLECTED':
        return 'status-collected';
    }
  }

  deleteBatch(batch: AllocationBatch): void {
    if (!confirm(`Cancel the allocation for ${batch.haribhaktName}? All its items will become unallocated.`)) {
      return;
    }
    this.allocationBatchService.delete(batch.id).subscribe({
      next: () => {
        this.snackBar.open(`Allocation for ${batch.haribhaktName} cancelled`, 'OK', { duration: 2500 });
        this.loadEventData();
      },
      error: (err) => this.snackBar.open(err?.error?.message ?? 'Delete failed', 'OK', { duration: 4000 }),
    });
  }

  removeItemFromBatch(batch: AllocationBatch, itemId: number): void {
    this.allocationBatchService.removeItem(batch.id, itemId).subscribe({
      next: () => {
        this.snackBar.open('Item removed from batch', 'OK', { duration: 2500 });
        this.loadEventData();
      },
      error: (err) => this.snackBar.open(err?.error?.message ?? 'Remove failed', 'OK', { duration: 4000 }),
    });
  }

  openAddItemsPanel(batchId: number): void {
    this.addingToBatchId.set(batchId);
    this.additionSelectedIds.set(new Set());
  }

  toggleAdditionSelection(itemId: number): void {
    const current = new Set(this.additionSelectedIds());
    if (current.has(itemId)) {
      current.delete(itemId);
    } else {
      current.add(itemId);
    }
    this.additionSelectedIds.set(current);
  }

  confirmAddItems(batch: AllocationBatch): void {
    const itemIds = Array.from(this.additionSelectedIds());
    if (itemIds.length === 0) {
      return;
    }
    this.allocationBatchService.addItems(batch.id, itemIds).subscribe({
      next: () => {
        this.snackBar.open(`${itemIds.length} item(s) added for ${batch.haribhaktName}`, 'OK', { duration: 2500 });
        this.addingToBatchId.set(null);
        this.loadEventData();
      },
      error: (err) => this.snackBar.open(err?.error?.message ?? 'Add failed', 'OK', { duration: 4000 }),
    });
  }
}
