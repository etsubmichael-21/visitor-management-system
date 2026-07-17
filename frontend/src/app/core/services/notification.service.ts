import { Injectable, inject } from '@angular/core';
import { Observable, interval, switchMap, startWith, map, catchError, of } from 'rxjs';
import { ApiService } from './api.service';
import { Notification, NotificationCount, NotificationQuery } from '../models/notification.model';
import { PagedResponse } from '../models/common.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private api = inject(ApiService);

  getNotifications(query?: NotificationQuery): Observable<PagedResponse<Notification>> {
    const params: Record<string, string | number | boolean> = {};
    if (query) {
      if (query.page) params['page'] = query.page;
      if (query.pageSize) params['pageSize'] = query.pageSize;
      if (query.isRead !== undefined) params['isRead'] = query.isRead;
    }
    return this.api.getPaged<Notification>('/notifications', params).pipe(map((res) => res.data));
  }

  getUnreadCount(): Observable<NotificationCount> {
    return this.api.get<NotificationCount>('/notifications/unread/count').pipe(map((res) => res.data));
  }

  markAsRead(id: string): Observable<void> {
    return this.api.post<void>(`/notifications/${id}/read`, {}).pipe(map((res) => res.data));
  }

  markAllAsRead(): Observable<void> {
    return this.api.post<void>('/notifications/read-all', {}).pipe(map((res) => res.data));
  }

  deleteNotification(id: string): Observable<void> {
    return this.api.delete<void>(`/notifications/${id}`).pipe(map((res) => res.data));
  }

  pollUnreadCount(intervalMs: number = 30000): Observable<NotificationCount> {
    return interval(intervalMs).pipe(
      startWith(0),
      switchMap(() =>
        this.getUnreadCount().pipe(catchError(() => of({ total: 0, unread: 0 })))
      )
    );
  }
}
