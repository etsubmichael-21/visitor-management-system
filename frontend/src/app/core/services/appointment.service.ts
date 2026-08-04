import { Injectable, inject } from '@angular/core';
import { HttpEvent } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import {
  Appointment,
  AppointmentRequest,
  AppointmentQuery,
  RescheduleRequest,
} from '../models/appointment.model';
import { ApiResponse, PagedResponse } from '../models/common.model';

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

  getAppointment(id: string | number): Observable<Appointment> {
    return this.api.get<Appointment>(`/appointments/${id}`).pipe(map((res) => res.data));
  }

  createAppointment(data: AppointmentRequest, supportingLetter?: File): Observable<Appointment> {
    return this.api
      .upload<Appointment>('/appointments', this.toFormData(data, supportingLetter))
      .pipe(map((res) => res.data));
  }

  createAppointmentWithProgress(
    data: AppointmentRequest,
    supportingLetter?: File
  ): Observable<HttpEvent<ApiResponse<Appointment>>> {
    return this.api.uploadWithProgress<Appointment>('/appointments', this.toFormData(data, supportingLetter));
  }

  getSupportingLetter(id: string | number, download = true): Observable<Blob> {
    return this.api.download(`/appointments/${id}/supporting-letter${download ? '?download=true' : ''}`);
  }

  private toFormData(data: AppointmentRequest, supportingLetter?: File): FormData {
    const fd = new FormData();
    if (data.visitorId != null) fd.append('visitorId', String(data.visitorId));
    fd.append('employeeId', String(data.employeeId));
    fd.append('requestedDate', data.requestedDate);
    fd.append('requestedStartTime', data.requestedStartTime);
    if (data.requestedEndTime) fd.append('requestedEndTime', data.requestedEndTime);
    fd.append('purpose', data.purpose ?? '');
    fd.append('isConfidential', String(!!data.isConfidential));
    if (data.routeType) fd.append('routeType', data.routeType);
    if (data.appointmentMethod) fd.append('appointmentMethod', data.appointmentMethod);
    if (data.notes) fd.append('notes', data.notes);
    if (supportingLetter) fd.append('supportingLetter', supportingLetter, supportingLetter.name);
    return fd;
  }

  rescheduleAppointment(id: string | number, data: RescheduleRequest): Observable<Appointment> {
    return this.api.post<Appointment>(`/appointments/${id}/reschedule`, data).pipe(map((res) => res.data));
  }

  cancelAppointment(id: string | number, reason?: string): Observable<Appointment> {
    return this.api.post<Appointment>(`/appointments/${id}/cancel`, { reason }).pipe(map((res) => res.data));
  }

  getUpcomingAppointments(): Observable<Appointment[]> {
    return this.api.get<Appointment[]>('/appointments/upcoming').pipe(map((res) => res.data));
  }

  getAppointmentStats(): Observable<{ total: number; pending: number; approved: number; completed: number }> {
    return this.api.get<{ total: number; pending: number; approved: number; completed: number }>('/appointments/stats').pipe(map((res) => res.data));
  }
}
