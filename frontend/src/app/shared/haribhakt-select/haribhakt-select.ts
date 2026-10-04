import { Component, computed, effect, input, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Haribhakt } from '../../core/models';

@Component({
  selector: 'app-haribhakt-select',
  standalone: true,
  imports: [FormsModule, MatAutocompleteModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule],
  template: `
    <mat-form-field appearance="outline" class="select-field">
      <mat-label>{{ label() }}</mat-label>
      <input
        matInput
        type="text"
        autocomplete="off"
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        [ngModel]="text()"
        (ngModelChange)="onTextChange($event)"
        (blur)="restoreText()"
        [matAutocomplete]="auto"
      />
      @if (text() && !disabled()) {
        <button matSuffix mat-icon-button type="button" aria-label="Clear" (mousedown)="$event.preventDefault()" (click)="clear()">
          <mat-icon>close</mat-icon>
        </button>
      } @else {
        <mat-icon matSuffix>search</mat-icon>
      }
      <mat-autocomplete #auto="matAutocomplete" (optionSelected)="onSelected($event)">
        @for (h of filtered(); track h.id) {
          <mat-option [value]="h.id">{{ h.name }}</mat-option>
        }
        @if (filtered().length === 0) {
          <mat-option disabled>No haribhakt found</mat-option>
        }
      </mat-autocomplete>
    </mat-form-field>
  `,
  styles: `
    :host {
      display: inline-block;
    }
    .select-field {
      width: 100%;
    }
  `,
})
export class HaribhaktSelect {
  haribhakts = input<Haribhakt[]>([]);
  label = input('Haribhakt');
  placeholder = input('');
  disabled = input(false);
  value = model<number | null>(null);

  text = signal('');

  filtered = computed(() => {
    const term = this.text().trim().toLowerCase();
    const list = this.haribhakts();
    return term ? list.filter((h) => h.name.toLowerCase().includes(term)) : list;
  });

  constructor() {
    // Keep the visible text in sync when the value is set or reset from outside.
    effect(() => {
      const id = this.value();
      const name = this.haribhakts().find((h) => h.id === id)?.name ?? '';
      this.text.set(name);
    });
  }

  onTextChange(text: string): void {
    this.text.set(text);
    if (!text.trim()) {
      this.value.set(null);
    }
  }

  onSelected(event: MatAutocompleteSelectedEvent): void {
    this.value.set(event.option.value);
    this.text.set(this.haribhakts().find((h) => h.id === event.option.value)?.name ?? '');
  }

  clear(): void {
    this.text.set('');
    this.value.set(null);
  }

  // Typed text that was never picked from the list is discarded.
  restoreText(): void {
    const name = this.haribhakts().find((h) => h.id === this.value())?.name ?? '';
    if (this.text() !== name) {
      this.text.set(name);
    }
  }
}
