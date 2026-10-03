import { AfterViewInit, Component, OnInit, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../core/auth.service';
import { Item, ItemRequest } from '../../core/models';
import { ItemService } from './item.service';

@Component({
  selector: 'app-items',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatCardModule,
    MatChipsModule,
  ],
  templateUrl: './items.html',
  styleUrl: './items.scss',
})
export class Items implements OnInit, AfterViewInit {
  displayedColumns = ['category', 'name', 'bowlCount', 'note', 'active', 'actions'];
  dataSource = new MatTableDataSource<Item>([]);
  showForm = signal(false);
  editing = signal<Item | null>(null);

  form: ItemRequest = this.emptyForm();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(public auth: AuthService, private itemService: ItemService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.reload();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  reload(): void {
    this.itemService.list(false).subscribe((items) => {
      this.dataSource.data = items;
    });
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = value;
  }

  openAddForm(): void {
    this.editing.set(null);
    this.form = this.emptyForm();
    this.showForm.set(true);
  }

  openEditForm(item: Item): void {
    this.editing.set(item);
    this.form = {
      name: item.name,
      category: item.category,
      bowlCount: item.bowlCount,
      note: item.note,
      active: item.active,
    };
    this.showForm.set(true);
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.editing.set(null);
  }

  save(): void {
    if (!this.form.name || !this.form.category) {
      return;
    }
    const current = this.editing();
    const request$ = current ? this.itemService.update(current.id, this.form) : this.itemService.create(this.form);
    request$.subscribe({
      next: () => {
        this.snackBar.open(current ? 'Item updated' : 'Item added', 'OK', { duration: 2500 });
        this.cancelForm();
        this.reload();
      },
      error: (err) => this.snackBar.open(err?.error?.message ?? 'Save failed', 'OK', { duration: 4000 }),
    });
  }

  remove(item: Item): void {
    if (!confirm(`Permanently delete item "${item.name}"? Any allocations of this item will also be removed.`)) {
      return;
    }
    this.itemService.delete(item.id).subscribe({
      next: () => {
        this.snackBar.open('Item deleted', 'OK', { duration: 2500 });
        this.reload();
      },
      error: (err) => this.snackBar.open(err?.error?.message ?? 'Delete failed', 'OK', { duration: 4000 }),
    });
  }

  private emptyForm(): ItemRequest {
    return { name: '', category: '', bowlCount: 1, note: null, active: true };
  }
}
