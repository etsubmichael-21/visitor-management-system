import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Visit, VisitCreate, CheckInRequest, CheckOutRequest } from '../models/visit.model';
import { PagedResponse, PageRequest } from '../models/paged-response.model';

@Injectable({ providedIn: 'root' })
export class VisitService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/visits`;

  getAll(request?: PageRequest): Observable<PagedResponse<Visit>> {
    return this.http.get<PagedResponse<Visit>>(this.apiUrl, { params: request as any });
  }

  getById(id: number): Observable<Visit> {
    return this.http.get<Visit>(`${this.apiUrl}/${id}`);
  }

  create(visit: VisitCreate): Observable<Visit> {
    return this.http.post<Visit>(this.apiUrl, visit);
  }

  checkIn(request: CheckInRequest): Observable<Visit> {
    return this.http.post<Visit>(`${this.apiUrl}/check-in`, request);
  }

  checkOut(id: number, request?: CheckOutRequest): Observable<Visit> {
    return this.http.post<Visit>(`${this.apiUrl}/${id}/check-out`, request ?? {});
  }

  cancel(id: number): Observable<Visit> {
    return this.http.post<Visit>(`${this.apiUrl}/${id}/cancel`, {});
  }

  getByVisitor(visitorId: number): Observable<Visit[]> {
    return this.http.get<Visit[]>(`${this.apiUrl}/by-visitor/${visitorId}`);
  }

  getByEmployee(employeeId: number): Observable<Visit[]> {
    return this.http.get<Visit[]>(`${this.apiUrl}/by-employee/${employeeId}`);
  }

  getTodayVisits(): Observable<Visit[]> {
    return this.http.get<Visit[]>(`${this.apiUrl}/today`);
  }

  getActiveVisits(): Observable<Visit[]> {
    return this.http.get<Visit[]>(`${this.apiUrl}/active`);
  }
}
