import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Visit, VisitCreate, CheckInRequest, CheckOutRequest } from '../models/visit.model';
import { PagedResponse, PageRequest } from '../models/paged-response.model';

@Injectable({ providedIn: 'root' })
export class VisitService {
  private api = inject(ApiService);

  getAll(request?: PageRequest): Observable<PagedResponse<Visit>> {
    const params: Record<string, string | number | boolean> = {};
    if (request) {
      Object.entries(request).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params[key] = value as string | number | boolean;
        }
      });
    }
    return this.api.get<PagedResponse<Visit>>('/visits', params).pipe(map((res) => res.data));
  }

  getById(id: number): Observable<Visit> {
    return this.api.get<Visit>(`/visits/${id}`).pipe(map((res) => res.data));
  }

  create(visit: VisitCreate): Observable<Visit> {
    return this.api.post<Visit>('/visits', visit).pipe(map((res) => res.data));
  }

  checkIn(request: CheckInRequest): Observable<Visit> {
    return this.api.post<Visit>('/visits/check-in', request).pipe(map((res) => res.data));
  }

  checkOut(id: number, request?: CheckOutRequest): Observable<Visit> {
    return this.api.post<Visit>(`/visits/${id}/check-out`, request ?? {}).pipe(map((res) => res.data));
  }

  cancel(id: number): Observable<Visit> {
    return this.api.post<Visit>(`/visits/${id}/cancel`, {}).pipe(map((res) => res.data));
  }

  getByVisitor(visitorId: number): Observable<Visit[]> {
    return this.api.get<Visit[]>(`/visits/by-visitor/${visitorId}`).pipe(map((res) => res.data));
  }

  getByEmployee(employeeId: number): Observable<Visit[]> {
    return this.api.get<Visit[]>(`/visits/by-employee/${employeeId}`).pipe(map((res) => res.data));
  }

  getTodayVisits(): Observable<Visit[]> {
    return this.api.get<Visit[]>('/visits/today').pipe(map((res) => res.data));
  }

  getActiveVisits(): Observable<Visit[]> {
    return this.api.get<Visit[]>('/visits/active').pipe(map((res) => res.data));
  }
}
