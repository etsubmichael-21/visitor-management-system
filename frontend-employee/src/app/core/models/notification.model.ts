export interface Notification {
  id: number;
  employeeId: number;
  appointmentId?: number;
  title: string;
  message: string;
  notificationType: NotificationType;
  priority: NotificationPriority;
  isRead: boolean;
  readAt?: string;
  channel: string;
  createdAt: string;
}

export type NotificationType = 'Info' | 'Warning' | 'Reminder' | 'Alert';

export type NotificationPriority = 'Low' | 'Normal' | 'High' | 'Urgent';

export interface NotificationFilter {
  isRead?: boolean;
  notificationType?: NotificationType;
  page?: number;
  limit?: number;
}

export interface UnreadCountResponse {
  count: number;
}
