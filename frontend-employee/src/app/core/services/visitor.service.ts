import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, PaginatedResponse } from '../models/common.model';

export interface Visitor {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  idType: string;
  idNumber: string;
  photoUrl?: string;
  totalVisits: number;
  lastVisit?: string;
  isBlacklisted: boolean;
  blacklistReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VisitorFilter {
  search?: string;
  isBlacklisted?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@Injectable({ providedIn: 'root' })
export class VisitorService {
  constructor(private api: ApiService) {}

  getAll(filter?: VisitorFilter): Observable<ApiResponse<PaginatedResponse<Visitor>>> {
    const params: Record<string, string> = {};
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params[key] = String(value);
        }
      });
    }
    return this.api.getList<Visitor>('/visitors', params);
  }

  getById(id: number): Observable<ApiResponse<Visitor>> {
    return this.api.get<Visitor>(`/visitors/${id}`);
  }

  search(query: string): Observable<ApiResponse<Visitor[]>> {
    return this.api.get<Visitor[]>(`/visitors/search?q=${encodeURIComponent(query)}`);
  }

  getVisitHistory(id: number): Observable<ApiResponse<any[]>> {
    return this.api.get<any[]>(`/visits/by-visitor/${id}`);
  }
}
