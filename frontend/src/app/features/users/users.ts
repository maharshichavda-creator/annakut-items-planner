import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppUser, Role, UserCreateRequest } from '../../core/models';
import { UserService } from './user.service';

@Component({
  selector: 'app-users',
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
    MatChipsModule,
    MatSlideToggleModule,
  ],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class Users implements OnInit {
  displayedColumns = ['username', 'fullName', 'role', 'enabled', 'actions'];
  users = signal<AppUser[]>([]);
  showForm = signal(false);
  form: UserCreateRequest = this.emptyForm();

  constructor(private userService: UserService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.userService.list().subscribe((list) => this.users.set(list));
  }

  openAddForm(): void {
    this.form = this.emptyForm();
    this.showForm.set(true);
  }

  cancelForm(): void {
    this.showForm.set(false);
  }

  save(): void {
    if (!this.form.username || !this.form.password || !this.form.fullName) {
      return;
    }
    this.userService.create(this.form).subscribe({
      next: () => {
        this.snackBar.open('User created', 'OK', { duration: 2500 });
        this.showForm.set(false);
        this.reload();
      },
      error: (err) => this.snackBar.open(err?.error?.message ?? 'Save failed', 'OK', { duration: 4000 }),
    });
  }

  toggleEnabled(user: AppUser): void {
    this.userService.update(user.id, { enabled: !user.enabled }).subscribe({
      next: () => {
        this.snackBar.open(`User ${user.enabled ? 'disabled' : 'enabled'}`, 'OK', { duration: 2500 });
        this.reload();
      },
      error: (err) => this.snackBar.open(err?.error?.message ?? 'Update failed', 'OK', { duration: 4000 }),
    });
  }

  changeRole(user: AppUser, role: Role): void {
    this.userService.update(user.id, { role }).subscribe({
      next: () => {
        this.snackBar.open(`Role updated to ${role}`, 'OK', { duration: 2500 });
        this.reload();
      },
      error: (err) => this.snackBar.open(err?.error?.message ?? 'Update failed', 'OK', { duration: 4000 }),
    });
  }

  remove(user: AppUser): void {
    if (!confirm(`Delete user "${user.username}"?`)) {
      return;
    }
    this.userService.delete(user.id).subscribe({
      next: () => {
        this.snackBar.open('User deleted', 'OK', { duration: 2500 });
        this.reload();
      },
      error: (err) => this.snackBar.open(err?.error?.message ?? 'Delete failed', 'OK', { duration: 4000 }),
    });
  }

  private emptyForm(): UserCreateRequest {
    return { username: '', password: '', fullName: '', role: 'VOLUNTEER' };
  }
}
