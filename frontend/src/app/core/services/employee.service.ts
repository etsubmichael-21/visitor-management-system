import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { Employee, EmployeeCreate, EmployeeUpdate } from '../models/employee.model';
import { PagedResponse, PageRequest } from '../models/paged-response.model';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private api = inject(ApiService);

  getAll(request?: PageRequest): Observable<PagedResponse<Employee>> {
    const params: Record<string, string | number | boolean> = {};
    if (request) {
      Object.entries(request).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params[key] = value as string | number | boolean;
        }
      });
    }
    return this.api.getPaged<Employee>('/employees', params).pipe(map((res) => res.data));
  }

  getByDepartment(departmentId: number): Observable<Employee[]> {
    return this.api.getPaged<Employee>('/employees', { pageSize: 100 }).pipe(
      map((res) => res.data.items.filter((emp) => emp.departmentId === departmentId))
    );
  }

  getById(id: number): Observable<Employee> {
    return this.api.get<Employee>(`/employees/${id}`).pipe(map((res) => res.data));
  }

  create(employee: EmployeeCreate): Observable<Employee> {
    return this.api.post<Employee>('/employees', employee).pipe(map((res) => res.data));
  }

  update(id: number, employee: EmployeeUpdate): Observable<Employee> {
    return this.api.put<Employee>(`/employees/${id}`, employee).pipe(map((res) => res.data));
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/employees/${id}`).pipe(map(() => undefined));
  }
}
