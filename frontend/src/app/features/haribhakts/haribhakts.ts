import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Haribhakt, HaribhaktRequest } from '../../core/models';
import { HaribhaktService } from './haribhakt.service';

@Component({
  selector: 'app-haribhakts',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
  ],
  templateUrl: './haribhakts.html',
  styleUrl: './haribhakts.scss',
})
export class Haribhakts implements OnInit {
  displayedColumns = ['name', 'mobileNumber', 'address', 'notes', 'actions'];
  haribhakts = signal<Haribhakt[]>([]);
  showForm = signal(false);
  editing = signal<Haribhakt | null>(null);
  form: HaribhaktRequest = this.emptyForm();

  constructor(private haribhaktService: HaribhaktService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.haribhaktService.list().subscribe((list) => this.haribhakts.set(list));
  }

  openAddForm(): void {
    this.editing.set(null);
    this.form = this.emptyForm();
    this.showForm.set(true);
  }

  openEditForm(h: Haribhakt): void {
    this.editing.set(h);
    this.form = { name: h.name, mobileNumber: h.mobileNumber, address: h.address, notes: h.notes };
    this.showForm.set(true);
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.editing.set(null);
  }

  save(): void {
    if (!this.form.name) {
      return;
    }
    const current = this.editing();
    const request$ = current
      ? this.haribhaktService.update(current.id, this.form)
      : this.haribhaktService.create(this.form);
    request$.subscribe({
      next: () => {
        this.snackBar.open(current ? 'Haribhakt updated' : 'Haribhakt added', 'OK', { duration: 2500 });
        this.cancelForm();
        this.reload();
      },
      error: (err) => this.snackBar.open(err?.error?.message ?? 'Save failed', 'OK', { duration: 4000 }),
    });
  }

  remove(h: Haribhakt): void {
    if (!confirm(`Delete haribhakt "${h.name}"?`)) {
      return;
    }
    this.haribhaktService.delete(h.id).subscribe({
      next: () => {
        this.snackBar.open('Haribhakt deleted', 'OK', { duration: 2500 });
        this.reload();
      },
      error: (err) => this.snackBar.open(err?.error?.message ?? 'Delete failed', 'OK', { duration: 4000 }),
    });
  }

  private emptyForm(): HaribhaktRequest {
    return { name: '', mobileNumber: null, address: null, notes: null };
  }
}
