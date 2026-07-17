import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import {
  Appointment,
  AppointmentRequest,
  AppointmentQuery,
  RescheduleRequest,
} from '../models/appointment.model';
import { PagedResponse } from '../models/common.model';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private api = inject(ApiService);

  getAppointments(query?: AppointmentQuery): Observable<PagedResponse<Appointment>> {
    const params: Record<string, string | number | boolean> = {};
    if (query) {
      if (query.page) params['page'] = query.page;
      if (query.pageSize) params['pageSize'] = query.pageSize;
      if (query.status) params['status'] = query.status;
      if (query.startDate) params['startDate'] = query.startDate;
      if (query.endDate) params['endDate'] = query.endDate;
      if (query.search) params['search'] = query.search;
    }
    return this.api.getPaged<Appointment>('/appointments', params).pipe(map((res) => res.data));
  }

  getAppointment(id: string): Observable<Appointment> {
    return this.api.get<Appointment>(`/appointments/${id}`).pipe(map((res) => res.data));
  }

  createAppointment(data: AppointmentRequest): Observable<Appointment> {
    return this.api.post<Appointment>('/appointments', data).pipe(map((res) => res.data));
  }

  rescheduleAppointment(id: string, data: RescheduleRequest): Observable<Appointment> {
    return this.api.post<Appointment>(`/appointments/${id}/reschedule`, data).pipe(map((res) => res.data));
  }

  cancelAppointment(id: string, reason?: string): Observable<Appointment> {
    return this.api.post<Appointment>(`/appointments/${id}/cancel`, { reason }).pipe(map((res) => res.data));
  }

  getUpcomingAppointments(): Observable<Appointment[]> {
    return this.api.get<Appointment[]>('/appointments/upcoming').pipe(map((res) => res.data));
  }

  getAppointmentStats(): Observable<{ total: number; pending: number; approved: number; completed: number }> {
    return this.api.get<{ total: number; pending: number; approved: number; completed: number }>('/appointments/stats').pipe(map((res) => res.data));
  }
}
