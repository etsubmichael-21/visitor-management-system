export interface Notification {
  id: string;
  employeeId: number;
  appointmentId?: number;
  title: string;
  message: string;
  notificationType: NotificationType;
  priority: string;
  isRead: boolean;
  readAt?: string;
  channel: string;
  createdAt: string;
}

export type NotificationType =
  | 'Info'
  | 'Warning'
  | 'Reminder'
  | 'Alert';

export interface NotificationQuery {
  page?: number;
  pageSize?: number;
  isRead?: boolean;
}

export interface NotificationCount {
  count: number;
}
