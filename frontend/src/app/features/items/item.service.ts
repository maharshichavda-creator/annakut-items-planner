import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/api-base';
import { Item, ItemRequest } from '../../core/models';

@Injectable({ providedIn: 'root' })
export class ItemService {
  private readonly baseUrl = `${API_BASE_URL}/items`;

  constructor(private http: HttpClient) {}

  list(activeOnly = false): Observable<Item[]> {
    return this.http.get<Item[]>(this.baseUrl, { params: { activeOnly } });
  }

  create(request: ItemRequest): Observable<Item> {
    return this.http.post<Item>(this.baseUrl, request);
  }

  update(id: number, request: ItemRequest): Observable<Item> {
    return this.http.put<Item>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
