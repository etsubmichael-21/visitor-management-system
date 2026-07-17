import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Employee, CreateEmployeeRequest, EmployeeFilter } from '../models/employee.model';
import { ApiResponse, PaginatedResponse } from '../models/common.model';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  constructor(private api: ApiService) {}

  getAll(filter?: EmployeeFilter): Observable<ApiResponse<PaginatedResponse<Employee>>> {
    const params: Record<string, string> = {};
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params[key] = String(value);
        }
      });
    }
    return this.api.getList<Employee>('/employees', params);
  }

  getById(id: number): Observable<ApiResponse<Employee>> {
    return this.api.get<Employee>(`/employees/${id}`);
  }

  create(request: CreateEmployeeRequest): Observable<ApiResponse<Employee>> {
    return this.api.post<Employee>('/employees', request);
  }

  update(id: number, request: Partial<CreateEmployeeRequest>): Observable<ApiResponse<Employee>> {
    return this.api.put<Employee>(`/employees/${id}`, request);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`/employees/${id}`);
  }

  toggleActive(id: number, employee: Employee): Observable<ApiResponse<Employee>> {
    return this.api.put<Employee>(`/employees/${id}`, {
      ...employee,
      isActive: !employee.status || employee.status !== 'Active' ? 'Active' : 'Inactive'
    });
  }

  search(query: string): Observable<ApiResponse<Employee[]>> {
    return this.api.get<Employee[]>(`/employees/search?q=${encodeURIComponent(query)}`);
  }
}
