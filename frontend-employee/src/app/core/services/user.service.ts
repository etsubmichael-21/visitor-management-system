import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { User, UserRole } from '../models/auth.model';
import { ApiResponse, PaginatedResponse } from '../models/common.model';

export interface CreateUserRequest {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  employeeId?: number;
  visitorId?: number;
}

export interface UserFilter {
  role?: UserRole;
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private api: ApiService) {}

  getAll(filter?: UserFilter): Observable<ApiResponse<PaginatedResponse<User>>> {
    const params: Record<string, string> = {};
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params[key] = String(value);
        }
      });
    }
    return this.api.getList<User>('/users', params);
  }

  getById(id: number): Observable<ApiResponse<User>> {
    return this.api.get<User>(`/users/${id}`);
  }

  create(request: CreateUserRequest): Observable<ApiResponse<User>> {
    return this.api.post<User>('/users', request);
  }

  update(id: number, request: Partial<CreateUserRequest>): Observable<ApiResponse<User>> {
    return this.api.put<User>(`/users/${id}`, request);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`/users/${id}`);
  }

  activate(id: number): Observable<ApiResponse<User>> {
    return this.api.patch<User>(`/users/${id}/activate`, {});
  }

  deactivate(id: number): Observable<ApiResponse<User>> {
    return this.api.patch<User>(`/users/${id}/deactivate`, {});
  }

  resetPassword(id: number): Observable<ApiResponse<any>> {
    return this.api.post<any>(`/users/${id}/reset-password`, {});
  }
}
