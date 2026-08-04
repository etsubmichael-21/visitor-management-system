import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { DashboardData, DeptHeadDashboardData } from '../models/dashboard.model';
import { ApiResponse } from '../models/common.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private api: ApiService) {}

  getAdminDashboard(): Observable<ApiResponse<DashboardData>> {
    return this.api.get<DashboardData>('/dashboard/admin');
  }

  getCeoDashboard(): Observable<ApiResponse<DashboardData>> {
    return this.api.get<DashboardData>('/dashboard/ceo');
  }

  getDeptHeadDashboard(): Observable<ApiResponse<DeptHeadDashboardData>> {
    return this.api.get<DeptHeadDashboardData>('/dashboard/department-head');
  }

  getEmployeeDashboard(): Observable<ApiResponse<DashboardData>> {
    return this.api.get<DashboardData>('/dashboard/employee');
  }

  getReceptionistDashboard(): Observable<ApiResponse<DashboardData>> {
    return this.api.get<DashboardData>('/dashboard/receptionist');
  }

  getSecurityDashboard(): Observable<ApiResponse<DashboardData>> {
    return this.api.get<DashboardData>('/dashboard/security');
  }
}
