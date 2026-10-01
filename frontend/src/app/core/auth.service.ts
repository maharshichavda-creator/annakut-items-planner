import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from './api-base';
import { LoginRequest, LoginResponse, Role } from './models';

const STORAGE_KEY = 'annakut.session';

interface StoredSession {
  token: string;
  username: string;
  fullName: string;
  role: Role;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly sessionSignal = signal<StoredSession | null>(this.readStoredSession());

  readonly session = this.sessionSignal.asReadonly();
  readonly isLoggedIn = computed(() => this.sessionSignal() !== null);
  readonly isAdmin = computed(() => this.sessionSignal()?.role === 'ADMIN');
  readonly fullName = computed(() => this.sessionSignal()?.fullName ?? '');
  readonly username = computed(() => this.sessionSignal()?.username ?? '');
  readonly role = computed(() => this.sessionSignal()?.role ?? null);

  constructor(private http: HttpClient, private router: Router) {}

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_BASE_URL}/auth/login`, request).pipe(
      tap((res) => {
        const session: StoredSession = {
          token: res.token ?? '',
          username: res.username,
          fullName: res.fullName,
          role: res.role
        };
        this.sessionSignal.set(session);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      })
    );
  }

  logout(): void {
    this.sessionSignal.set(null);
    localStorage.removeItem(STORAGE_KEY);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.sessionSignal()?.token ?? null;
  }

  private readStoredSession(): StoredSession | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as StoredSession;
    } catch {
      return null;
    }
  }
}
