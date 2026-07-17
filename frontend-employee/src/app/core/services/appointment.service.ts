import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  Appointment,
  AppointmentFilter,
  CreateAppointmentRequest,
  ApproveAppointmentRequest,
  RejectAppointmentRequest,
  DelegateAppointmentRequest
} from '../models/appointment.model';
import { ApiResponse, PaginatedResponse } from '../models/common.model';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  constructor(private api: ApiService) {}

  getAll(filter?: AppointmentFilter): Observable<ApiResponse<PaginatedResponse<Appointment>>> {
    const params: Record<string, string> = {};
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params[key] = String(value);
        }
      });
    }
    return this.api.getList<Appointment>('/appointments', params);
  }

  getById(id: number): Observable<ApiResponse<Appointment>> {
    return this.api.get<Appointment>(`/appointments/${id}`);
  }

  create(request: CreateAppointmentRequest): Observable<ApiResponse<Appointment>> {
    return this.api.post<Appointment>('/appointments', request);
  }

  update(id: number, request: Partial<CreateAppointmentRequest>): Observable<ApiResponse<Appointment>> {
    return this.api.put<Appointment>(`/appointments/${id}`, request);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`/appointments/${id}`);
  }

  approve(request: ApproveAppointmentRequest): Observable<ApiResponse<Appointment>> {
    return this.api.post<Appointment>(`/appointments/${request.appointmentId}/approve`, request);
  }

  reject(request: RejectAppointmentRequest): Observable<ApiResponse<Appointment>> {
    return this.api.post<Appointment>(`/appointments/${request.appointmentId}/reject`, request);
  }

  delegate(request: DelegateAppointmentRequest): Observable<ApiResponse<Appointment>> {
    return this.api.post<Appointment>(`/appointments/${request.appointmentId}/delegate`, request);
  }

  complete(id: number): Observable<ApiResponse<Appointment>> {
    return this.api.post<Appointment>(`/appointments/${id}/complete`, {});
  }

  cancel(id: number): Observable<ApiResponse<Appointment>> {
    return this.api.post<Appointment>(`/appointments/${id}/cancel`, {});
  }

  getPendingApprovals(): Observable<ApiResponse<Appointment[]>> {
    return this.api.get<Appointment[]>('/appointments/pending');
  }
}
