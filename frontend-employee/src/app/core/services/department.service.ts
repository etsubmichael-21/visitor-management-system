import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Department, CreateDepartmentRequest } from '../models/common.model';
import { ApiResponse } from '../models/common.model';

@Injectable({ providedIn: 'root' })
export class DepartmentService {
  constructor(private api: ApiService) {}

  getAll(): Observable<ApiResponse<Department[]>> {
    return this.api.get<Department[]>('/departments');
  }

  getById(id: number): Observable<ApiResponse<Department>> {
    return this.api.get<Department>(`/departments/${id}`);
  }

  create(request: CreateDepartmentRequest): Observable<ApiResponse<Department>> {
    return this.api.post<Department>('/departments', request);
  }

  update(id: number, request: Partial<CreateDepartmentRequest>): Observable<ApiResponse<Department>> {
    return this.api.put<Department>(`/departments/${id}`, request);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`/departments/${id}`);
  }

  toggleActive(id: number, department: Department): Observable<ApiResponse<Department>> {
    return this.api.put<Department>(`/departments/${id}`, {
      name: department.name,
      description: department.description,
      location: department.location,
      phone: department.phone,
      email: department.email
    });
  }
}
