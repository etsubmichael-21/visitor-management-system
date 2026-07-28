import { Injectable, inject } from '@angular/core';
import { Observable, interval, switchMap, startWith, map, catchError, of, Subject } from 'rxjs';
import { ApiService } from './api.service';
import { Notification, NotificationCount, NotificationQuery } from '../models/notification.model';
import { PagedResponse } from '../models/common.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private api = inject(ApiService);

  private refreshUnreadCountSubject = new Subject<void>();
  refreshUnreadCount$ = this.refreshUnreadCountSubject.asObservable();

  getNotifications(query?: NotificationQuery): Observable<PagedResponse<Notification>> {
    const params: Record<string, string | number | boolean> = {};
    if (query) {
      if (query.page) params['page'] = query.page;
      if (query.pageSize) params['pageSize'] = query.pageSize;
      if (query.isRead !== undefined) params['isRead'] = query.isRead;
    }
    return this.api.getPaged<Notification>('/notifications', params).pipe(
      map((res) => res.data),
      catchError(() => of({ items: [], totalCount: 0, page: 1, pageSize: 10, totalPages: 0, hasNext: false, hasPrevious: false } as PagedResponse<Notification>))
    );
  }

  getVisitorNotifications(visitorId: number, query?: NotificationQuery): Observable<PagedResponse<Notification>> {
    const params: Record<string, string | number | boolean> = {};
    if (query) {
      if (query.page) params['page'] = query.page;
      if (query.pageSize) params['pageSize'] = query.pageSize;
    }
    return this.api.getPaged<Notification>(`/notifications/visitor/${visitorId}`, params).pipe(
      map((res) => res.data),
      catchError(() => of({ items: [], totalCount: 0, page: 1, pageSize: 10, totalPages: 0, hasNext: false, hasPrevious: false } as PagedResponse<Notification>))
    );
  }

  getUnreadCount(): Observable<NotificationCount> {
    return this.api.get<NotificationCount>('/notifications/unread/count').pipe(
      map((res) => res.data),
      catchError(() => of({ count: 0 }))
    );
  }

  getVisitorUnreadCount(visitorId: number): Observable<NotificationCount> {
    return this.api.get<NotificationCount>(`/notifications/visitor/${visitorId}/unread/count`).pipe(
      map((res) => res.data),
      catchError(() => of({ count: 0 }))
    );
  }

  markAsRead(id: number): Observable<void> {
    return this.api.post<void>(`/notifications/${id}/read`, {}).pipe(
      map((res) => res.data),
      switchMap(() => { this.refreshUnreadCountSubject.next(); return of(undefined as void); }),
      catchError(() => of(undefined as void))
    );
  }

  markVisitorNotificationRead(visitorId: number, notificationId: number): Observable<void> {
    return this.api.post<void>(`/notifications/visitor/${visitorId}/read/${notificationId}`, {}).pipe(
      map((res) => res.data),
      switchMap(() => { this.refreshUnreadCountSubject.next(); return of(undefined as void); }),
      catchError(() => of(undefined as void))
    );
  }

  markAllAsRead(): Observable<void> {
    return this.api.post<void>('/notifications/read-all', {}).pipe(
      map((res) => res.data),
      switchMap(() => { this.refreshUnreadCountSubject.next(); return of(undefined as void); }),
      catchError(() => of(undefined as void))
    );
  }

  markAllVisitorNotificationsRead(visitorId: number): Observable<void> {
    return this.api.post<void>(`/notifications/visitor/${visitorId}/read-all`, {}).pipe(
      map((res) => res.data),
      switchMap(() => { this.refreshUnreadCountSubject.next(); return of(undefined as void); }),
      catchError(() => of(undefined as void))
    );
  }

  triggerRefresh(): void {
    this.refreshUnreadCountSubject.next();
  }

  deleteNotification(id: number): Observable<void> {
    return this.api.delete<void>(`/notifications/${id}`).pipe(
      map((res) => res.data),
      catchError(() => of(undefined as void))
    );
  }

  pollVisitorUnreadCount(visitorId: number, intervalMs: number = 30000): Observable<NotificationCount> {
    return interval(intervalMs).pipe(
      startWith(0),
      switchMap(() =>
        this.getVisitorUnreadCount(visitorId).pipe(catchError(() => of({ count: 0 })))
      )
    );
  }

  pollUnreadCount(intervalMs: number = 30000): Observable<NotificationCount> {
    return interval(intervalMs).pipe(
      startWith(0),
      switchMap(() =>
        this.getUnreadCount().pipe(catchError(() => of({ count: 0 })))
      )
    );
  }
}
