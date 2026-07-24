import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Notification, NotificationFilter, UnreadCountResponse } from '../models/notification.model';
import { ApiResponse, PaginatedResponse } from '../models/common.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private api: ApiService) {}

  getAll(filter?: NotificationFilter): Observable<ApiResponse<PaginatedResponse<Notification>>> {
    const params: Record<string, string> = {};
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params[key] = String(value);
        }
      });
    }
    return this.api.getList<Notification>('/notifications', params);
  }

  getUnreadCount(): Observable<ApiResponse<UnreadCountResponse>> {
    return this.api.get<UnreadCountResponse>('/notifications/unread/count');
  }

  markAsRead(id: number): Observable<ApiResponse<Notification>> {
    return this.api.post<Notification>(`/notifications/${id}/read`, {});
  }

  markAllAsRead(): Observable<ApiResponse<void>> {
    return this.api.post<void>('/notifications/read-all', {});
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`/notifications/${id}`);
  }
}
