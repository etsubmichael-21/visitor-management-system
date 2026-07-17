import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { Department } from '../models/department.model';
import { PagedResponse, PageRequest } from '../models/paged-response.model';

@Injectable({ providedIn: 'root' })
export class DepartmentService {
  private api = inject(ApiService);

  getDepartments(): Observable<Department[]> {
    return this.api.getPaged<Department>('/departments', { pageSize: 100 }).pipe(map((res) => res.data.items));
  }

  getDepartment(id: string): Observable<Department> {
    return this.api.get<Department>(`/departments/${id}`).pipe(map((res) => res.data));
  }

  getAll(request?: PageRequest): Observable<PagedResponse<Department>> {
    const params: Record<string, string | number | boolean> = {};
    if (request) {
      Object.entries(request).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params[key] = value as string | number | boolean;
        }
      });
    }
    return this.api.get<PagedResponse<Department>>('/departments', params).pipe(map((res) => res.data));
  }

  getById(id: number): Observable<Department> {
    return this.api.get<Department>(`/departments/${id}`).pipe(map((res) => res.data));
  }

  create(data: Partial<Department>): Observable<Department> {
    return this.api.post<Department>('/departments', data).pipe(map((res) => res.data));
  }

  update(id: number, data: Partial<Department>): Observable<Department> {
    return this.api.put<Department>(`/departments/${id}`, data).pipe(map((res) => res.data));
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/departments/${id}`).pipe(map(() => undefined));
  }
}
