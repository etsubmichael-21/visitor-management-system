import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Visit, VisitFilter, CheckInRequest, CheckOutRequest } from '../models/visit.model';
import { ApiResponse, PaginatedResponse } from '../models/common.model';

@Injectable({ providedIn: 'root' })
export class VisitService {
  constructor(private api: ApiService) {}

  getAll(filter?: VisitFilter): Observable<ApiResponse<PaginatedResponse<Visit>>> {
    return this.api.getList<Visit>('/visits', this.buildParams(filter));
  }

  getReceptionToday(filter?: VisitFilter): Observable<ApiResponse<PaginatedResponse<Visit>>> {
    return this.api.getList<Visit>('/visits/reception-today', this.buildParams(filter));
  }

  private buildParams(filter?: VisitFilter): Record<string, string> {
    const params: Record<string, string> = {};
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params[key] = String(value);
        }
      });
    }
    return params;
  }

  getById(id: number): Observable<ApiResponse<Visit>> {
    return this.api.get<Visit>(`/visits/${id}`);
  }

  checkIn(request: CheckInRequest): Observable<ApiResponse<Visit>> {
    return this.api.post<Visit>('/visits/check-in', request);
  }

  checkOut(id: number, request: CheckOutRequest): Observable<ApiResponse<Visit>> {
    return this.api.post<Visit>(`/visits/${id}/check-out`, request);
  }

  getActiveVisits(): Observable<ApiResponse<Visit[]>> {
    return this.api.get<Visit[]>('/visits/active');
  }

  getTodayVisits(): Observable<ApiResponse<Visit[]>> {
    return this.api.get<Visit[]>('/visits/today');
  }

  cancel(id: number): Observable<ApiResponse<Visit>> {
    return this.api.post<Visit>(`/visits/${id}/cancel`, {});
  }

  getByVisitorId(visitorId: number): Observable<ApiResponse<any[]>> {
    return this.api.get<any[]>(`/visits/by-visitor/${visitorId}`);
  }
}
