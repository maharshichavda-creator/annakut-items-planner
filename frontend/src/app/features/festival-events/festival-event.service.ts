import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../../core/api-base';
import { FestivalEvent, FestivalEventRequest } from '../../core/models';

@Injectable({ providedIn: 'root' })
export class FestivalEventService {
  private readonly baseUrl = `${API_BASE_URL}/festival-events`;

  // Shared across the whole app so any component that activates a different
  // festival year (e.g. the Festival Years admin page) immediately updates
  // everywhere it's shown (e.g. the toolbar/title year badge).
  private readonly activeEventSignal = signal<FestivalEvent | null>(null);
  readonly activeEvent = this.activeEventSignal.asReadonly();

  constructor(private http: HttpClient) {}

  list(): Observable<FestivalEvent[]> {
    return this.http.get<FestivalEvent[]>(this.baseUrl);
  }

  getActive(): Observable<FestivalEvent> {
    return this.http.get<FestivalEvent>(`${this.baseUrl}/active`).pipe(tap((event) => this.activeEventSignal.set(event)));
  }

  refreshActive(): void {
    this.getActive().subscribe({ error: () => this.activeEventSignal.set(null) });
  }

  create(request: FestivalEventRequest): Observable<FestivalEvent> {
    return this.http.post<FestivalEvent>(this.baseUrl, request).pipe(
      tap((event) => {
        if (event.active) {
          this.activeEventSignal.set(event);
        }
      })
    );
  }

  activate(id: number): Observable<FestivalEvent> {
    return this.http
      .post<FestivalEvent>(`${this.baseUrl}/${id}/activate`, {})
      .pipe(tap((event) => this.activeEventSignal.set(event)));
  }

  deactivate(id: number): Observable<FestivalEvent> {
    return this.http.post<FestivalEvent>(`${this.baseUrl}/${id}/deactivate`, {}).pipe(
      tap((event) => {
        if (this.activeEventSignal()?.id === id) {
          this.activeEventSignal.set(null);
        }
      })
    );
  }
}
