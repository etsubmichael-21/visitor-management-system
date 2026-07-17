import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { ReportData } from '../models/common.model';
import { ApiResponse } from '../models/common.model';

interface VisitorReportResponse {
  totalVisitors: number;
  newVisitors: number;
  returningVisitors: number;
  items: { visitorId: number; fullName: string; organization?: string; visitCount: number; lastVisitDate: string }[];
}

interface AppointmentReportResponse {
  totalAppointments: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  completedCount: number;
  cancelledCount: number;
  items: { appointmentId: number; visitorName: string; employeeName: string; departmentName: string; purpose: string; requestedDate: string; status: string }[];
}

interface DepartmentReportResponse {
  departmentId: number;
  departmentName: string;
  totalAppointments: number;
  employeeCount: number;
  pendingApprovals: number;
  completedVisits: number;
}

@Injectable({ providedIn: 'root' })
export class ReportService {
  constructor(private api: ApiService) {}

  generateReport(filter: { reportType: string; dateFrom: string; dateTo: string; departmentId?: number }): Observable<ApiResponse<ReportData>> {
    switch (filter.reportType) {
      case 'appointments':
        return this.getAppointmentReport(filter.dateFrom, filter.dateTo, filter.departmentId);
      case 'departments':
        return this.getDepartmentReport(filter.dateFrom, filter.dateTo);
      default:
        return this.getVisitorReport(filter.dateFrom, filter.dateTo, filter.departmentId);
    }
  }

  getVisitorReport(dateFrom: string, dateTo: string, departmentId?: number): Observable<ApiResponse<ReportData>> {
    const params: Record<string, string> = { startDate: dateFrom, endDate: dateTo };
    if (departmentId) params['departmentId'] = String(departmentId);
    return this.api.get<VisitorReportResponse>('/reports/visitors', params).pipe(
      map(res => ({
        success: res.success,
        message: res.message,
        data: res.data ? {
          title: 'Visitor Report',
          generatedAt: new Date().toISOString(),
          filters: { dateFrom, dateTo, departmentId, reportType: 'visitors' as const },
          summary: {
            'Total Visitors': res.data.totalVisitors,
            'New Visitors': res.data.newVisitors,
            'Returning Visitors': res.data.returningVisitors
          },
          details: (res.data.items || []).map(i => ({
            Name: i.fullName,
            Organization: i.organization || 'N/A',
            Visits: i.visitCount,
            LastVisit: i.lastVisitDate
          })),
          charts: {
            labels: ['New', 'Returning'],
            datasets: [{ label: 'Visitors', data: [res.data.newVisitors, res.data.returningVisitors] }]
          }
        } : undefined as any
      }))
    );
  }

  getAppointmentReport(dateFrom: string, dateTo: string, departmentId?: number): Observable<ApiResponse<ReportData>> {
    const params: Record<string, string> = { startDate: dateFrom, endDate: dateTo };
    if (departmentId) params['departmentId'] = String(departmentId);
    return this.api.get<AppointmentReportResponse>('/reports/appointments', params).pipe(
      map(res => ({
        success: res.success,
        message: res.message,
        data: res.data ? {
          title: 'Appointment Report',
          generatedAt: new Date().toISOString(),
          filters: { dateFrom, dateTo, departmentId, reportType: 'appointments' as const },
          summary: {
            'Total': res.data.totalAppointments,
            'Pending': res.data.pendingCount,
            'Approved': res.data.approvedCount,
            'Rejected': res.data.rejectedCount,
            'Completed': res.data.completedCount,
            'Cancelled': res.data.cancelledCount
          },
          details: (res.data.items || []).map(i => ({
            Visitor: i.visitorName,
            Employee: i.employeeName,
            Department: i.departmentName,
            Purpose: i.purpose,
            Date: i.requestedDate,
            Status: i.status
          })),
          charts: {
            labels: ['Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled'],
            datasets: [{ label: 'Appointments', data: [res.data.pendingCount, res.data.approvedCount, res.data.rejectedCount, res.data.completedCount, res.data.cancelledCount] }]
          }
        } : undefined as any
      }))
    );
  }

  getDepartmentReport(dateFrom: string, dateTo: string): Observable<ApiResponse<ReportData>> {
    const params: Record<string, string> = { startDate: dateFrom, endDate: dateTo };
    return this.api.get<DepartmentReportResponse[]>('/reports/departments', params).pipe(
      map(res => ({
        success: res.success,
        message: res.message,
        data: res.data ? {
          title: 'Department Report',
          generatedAt: new Date().toISOString(),
          filters: { dateFrom, dateTo, reportType: 'departments' as const },
          summary: {
            'Departments': res.data.length,
            'Total Appointments': res.data.reduce((sum: number, d: DepartmentReportResponse) => sum + d.totalAppointments, 0),
            'Total Employees': res.data.reduce((sum: number, d: DepartmentReportResponse) => sum + d.employeeCount, 0)
          },
          details: res.data.map((d: DepartmentReportResponse) => ({
            Department: d.departmentName,
            Employees: d.employeeCount,
            Appointments: d.totalAppointments,
            Pending: d.pendingApprovals,
            Completed: d.completedVisits
          })),
          charts: {
            labels: res.data.map((d: DepartmentReportResponse) => d.departmentName),
            datasets: [{ label: 'Appointments', data: res.data.map((d: DepartmentReportResponse) => d.totalAppointments) }]
          }
        } : undefined as any
      }))
    );
  }

  exportVisitors(dateFrom: string, dateTo: string, format: string = 'csv'): Observable<Blob> {
    const params: Record<string, string> = { startDate: dateFrom, endDate: dateTo, format };
    return this.api.get<Blob>('/reports/export/visitors', params) as any;
  }

  exportAppointments(dateFrom: string, dateTo: string, format: string = 'csv'): Observable<Blob> {
    const params: Record<string, string> = { startDate: dateFrom, endDate: dateTo, format };
    return this.api.get<Blob>('/reports/export/appointments', params) as any;
  }
}
