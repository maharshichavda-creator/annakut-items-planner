import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/api-base';
import { AllocationBatch, BatchStatus, BulkAllocationRequest } from '../../core/models';

@Injectable({ providedIn: 'root' })
export class AllocationBatchService {
  private readonly baseUrl = `${API_BASE_URL}/allocation-batches`;

  constructor(private http: HttpClient) {}

  list(eventId?: number, haribhaktId?: number): Observable<AllocationBatch[]> {
    const params: Record<string, number> = {};
    if (eventId) params['eventId'] = eventId;
    if (haribhaktId) params['haribhaktId'] = haribhaktId;
    return this.http.get<AllocationBatch[]>(this.baseUrl, { params });
  }

  create(request: BulkAllocationRequest): Observable<AllocationBatch> {
    return this.http.post<AllocationBatch>(this.baseUrl, request);
  }

  addItems(batchId: number, itemIds: number[], quantity = 1): Observable<AllocationBatch> {
    return this.http.post<AllocationBatch>(`${this.baseUrl}/${batchId}/items`, { itemIds, quantity });
  }

  removeItem(batchId: number, itemId: number): Observable<AllocationBatch> {
    return this.http.delete<AllocationBatch>(`${this.baseUrl}/${batchId}/items/${itemId}`);
  }

  updateStatus(batchId: number, status: BatchStatus, notes?: string): Observable<AllocationBatch> {
    return this.http.patch<AllocationBatch>(`${this.baseUrl}/${batchId}/status`, { status, notes });
  }

  delete(batchId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${batchId}`);
  }
}
