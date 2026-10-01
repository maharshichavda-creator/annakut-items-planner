import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/api-base';
import { Haribhakt, HaribhaktRequest } from '../../core/models';

@Injectable({ providedIn: 'root' })
export class HaribhaktService {
  private readonly baseUrl = `${API_BASE_URL}/haribhakts`;

  constructor(private http: HttpClient) {}

  list(): Observable<Haribhakt[]> {
    return this.http.get<Haribhakt[]>(this.baseUrl);
  }

  create(request: HaribhaktRequest): Observable<Haribhakt> {
    return this.http.post<Haribhakt>(this.baseUrl, request);
  }

  update(id: number, request: HaribhaktRequest): Observable<Haribhakt> {
    return this.http.put<Haribhakt>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
