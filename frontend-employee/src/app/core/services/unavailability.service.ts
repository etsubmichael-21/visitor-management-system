import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { EmployeeUnavailability, CreateUnavailabilityRequest } from '../models/unavailability.model';
import { ApiResponse } from '../models/common.model';

@Injectable({ providedIn: 'root' })
export class UnavailabilityService {
  private api = inject(ApiService);

  getAll(employeeId?: number): Observable<ApiResponse<EmployeeUnavailability[]>> {
    const params: Record<string, string> = {};
    if (employeeId) params['employeeId'] = employeeId.toString();
    return this.api.get<EmployeeUnavailability[]>('/employee-unavailability', params);
  }

  getById(id: number): Observable<ApiResponse<EmployeeUnavailability>> {
    return this.api.get<EmployeeUnavailability>(`/employee-unavailability/${id}`);
  }

  create(data: CreateUnavailabilityRequest): Observable<ApiResponse<EmployeeUnavailability>> {
    return this.api.post<EmployeeUnavailability>('/employee-unavailability', data);
  }

  delete(id: number): Observable<ApiResponse<any>> {
    return this.api.delete<any>(`/employee-unavailability/${id}`);
  }
}
