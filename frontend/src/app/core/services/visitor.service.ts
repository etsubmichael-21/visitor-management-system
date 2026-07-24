import { Injectable, inject } from '@angular/core';
import { Observable, map, switchMap } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { Visitor, VisitorCreate, VisitorProfile, UpdateProfileRequest, VisitorStats } from '../models/visitor.model';
import { Appointment } from '../models/appointment.model';
import { PagedResponse, PageRequest } from '../models/paged-response.model';

@Injectable({ providedIn: 'root' })
export class VisitorService {
  private api = inject(ApiService);
  private auth = inject(AuthService);

  private get visitorId(): number | null {
    const user = this.auth.currentUser;
    return (user as any)?.visitorId ?? null;
  }

  getProfile(): Observable<VisitorProfile> {
    return this.getVisitor(String(this.visitorId)).pipe(
      map((v) => ({
        id: String(v.id),
        fullName: v.fullName,
        email: v.email,
        phone: v.phone,
        photoUrl: v.photoUrl,
        address: v.address,
        nationalId: v.nationalId,
        organization: v.organization,
        gender: v.gender,
      }))
    );
  }

  updateProfile(data: UpdateProfileRequest): Observable<VisitorProfile> {
    const id = this.visitorId;
    return this.api.put<Visitor>(`/visitors/${id}`, data).pipe(
      map((res) => {
        const v = res.data;
        return {
          id: String(v.id),
          fullName: v.fullName,
          email: v.email,
          phone: v.phone,
          photoUrl: v.photoUrl,
          address: v.address,
          nationalId: v.nationalId,
          organization: v.organization,
          gender: v.gender,
        };
      })
    );
  }

  uploadPhoto(file: File): Observable<{ photoUrl: string }> {
    const id = this.visitorId;
    const formData = new FormData();
    formData.append('file', file);
    return this.api.upload<{ photoUrl: string }>(`/visitors/${id}/photo`, formData).pipe(map((res) => res.data));
  }

  getVisitorStats(): Observable<VisitorStats> {
    return this.api.get<any>('/dashboard/visitor').pipe(
      map((res) => ({
        totalAppointments: res.data?.totalAppointments ?? 0,
        pendingAppointments: res.data?.pendingAppointments ?? 0,
        approvedAppointments: res.data?.approvedAppointments ?? 0,
        completedAppointments: res.data?.completedAppointments ?? 0,
        cancelledAppointments: res.data?.cancelledAppointments ?? 0,
        upcomingAppointments: res.data?.upcomingAppointments ?? 0,
        totalVisits: res.data?.totalVisits ?? 0,
      }))
    );
  }

  getVisitor(id: string): Observable<Visitor> {
    return this.api.get<Visitor>(`/visitors/${id}`).pipe(map((res) => res.data));
  }

  getAll(request?: PageRequest): Observable<PagedResponse<Visitor>> {
    const params: Record<string, string | number | boolean> = {};
    if (request) {
      Object.entries(request).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params[key] = value as string | number | boolean;
        }
      });
    }
    return this.api.get<PagedResponse<Visitor>>('/visitors', params).pipe(map((res) => res.data));
  }

  getById(id: string | number): Observable<Visitor> {
    return this.api.get<Visitor>(`/visitors/${id}`).pipe(map((res) => res.data));
  }

  create(data: VisitorCreate): Observable<Visitor> {
    return this.api.post<Visitor>('/visitors', data).pipe(map((res) => res.data));
  }

  update(id: string | number, data: Partial<VisitorCreate>): Observable<Visitor> {
    return this.api.put<Visitor>(`/visitors/${id}`, data).pipe(map((res) => res.data));
  }

  delete(id: string | number): Observable<void> {
    return this.api.delete<void>(`/visitors/${id}`).pipe(map(() => undefined));
  }

  getVisitorRecentAppointments(): Observable<Appointment[]> {
    return this.api.get<any>('/dashboard/visitor').pipe(
      map((res) => (res.data?.recentAppointments ?? []).map((a: any) => ({
        id: String(a.id),
        visitorId: String(a.visitorId),
        employeeId: String(a.employeeId),
        employeeName: a.employeeName,
        departmentName: a.departmentName,
        purpose: a.purpose,
        status: a.status,
        requestedDate: a.requestedDate,
        requestedStartTime: a.requestedStartTime,
        requestedEndTime: a.requestedEndTime,
        checkInAllowed: a.checkInAllowed,
        isConfidential: a.isConfidential,
        appointmentCode: a.appointmentCode,
        notes: a.notes,
        attachments: [],
        commentCount: 0,
        createdAt: a.createdAt,
      } as Appointment)))
    );
  }
}
