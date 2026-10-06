import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FestivalEvent, FestivalEventRequest } from '../../core/models';
import { FestivalEventService } from './festival-event.service';

@Component({
  selector: 'app-festival-events',
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
    MatChipsModule,
  ],
  templateUrl: './festival-events.html',
  styleUrl: './festival-events.scss',
})
export class FestivalEvents implements OnInit {
  displayedColumns = ['year', 'name', 'location', 'annakutDate', 'active', 'actions'];
  events = signal<FestivalEvent[]>([]);
  showForm = signal(false);
  form: FestivalEventRequest = this.emptyForm();

  constructor(private festivalEventService: FestivalEventService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.festivalEventService.list().subscribe((list) => this.events.set(list));
  }

  openAddForm(): void {
    this.form = this.emptyForm();
    this.showForm.set(true);
  }

  cancelForm(): void {
    this.showForm.set(false);
  }

  save(): void {
    if (!this.form.year || !this.form.name || !this.form.annakutDate) {
      return;
    }
    this.festivalEventService.create(this.form).subscribe({
      next: () => {
        this.snackBar.open(`Festival year ${this.form.year} created`, 'OK', { duration: 2500 });
        this.showForm.set(false);
        this.reload();
      },
      error: (err) => this.snackBar.open(err?.error?.message ?? 'Save failed', 'OK', { duration: 4000 }),
    });
  }

  activate(event: FestivalEvent): void {
    this.festivalEventService.activate(event.id).subscribe({
      next: () => {
        this.snackBar.open(`${event.year} is now the active festival year`, 'OK', { duration: 2500 });
        this.reload();
      },
      error: (err) => this.snackBar.open(err?.error?.message ?? 'Activation failed', 'OK', { duration: 4000 }),
    });
  }

  deactivate(event: FestivalEvent): void {
    if (!confirm(`Make ${event.year} inactive? No festival year will be active until one is activated again.`)) {
      return;
    }
    this.festivalEventService.deactivate(event.id).subscribe({
      next: () => {
        this.snackBar.open(`${event.year} is now inactive`, 'OK', { duration: 2500 });
        this.reload();
      },
      error: (err) => this.snackBar.open(err?.error?.message ?? 'Deactivation failed', 'OK', { duration: 4000 }),
    });
  }

  private emptyForm(): FestivalEventRequest {
    const nextYear = new Date().getFullYear() + 1;
    return { year: nextYear, name: 'અન્નકૂટ મહોત્સવ', location: 'BAPS Pune', annakutDate: '', active: false };
  }
}
