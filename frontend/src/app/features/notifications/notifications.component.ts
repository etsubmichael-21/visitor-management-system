import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotificationService } from '../../core/services/notification.service';
import { Notification } from '../../core/models/notification.model';
import { PagedResponse } from '../../core/models/common.model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatTabsModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="notifications-page fade-in">
      <div class="page-header">
        <div>
          <h1 class="page-title">Notifications</h1>
          <p class="page-subtitle">Stay updated on your appointments and visits</p>
        </div>
        @if (unreadNotifications.length > 0) {
        <button mat-stroked-button color="primary" (click)="markAllAsRead()">
          <mat-icon>done_all</mat-icon>
          Mark All Read
        </button>
      }
    </div>

    @if (loading) {
      <div class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
      </div>
    }

    @if (!loading && notifications.length === 0) {
      <div class="empty-state">
        <mat-icon>notifications_none</mat-icon>
        <h3>No Notifications</h3>
        <p>You're all caught up! Notifications about your appointments will appear here.</p>
      </div>
    }

    @if (!loading && notifications.length > 0) {
      <div class="notifications-list">
        @for (n of notifications; track n.id) {
          <mat-card class="notification-card" [class.unread]="!n.isRead" (click)="markAsRead(n)">
            <mat-card-content>
              <div class="noti-icon" [class]="getIconClass(n.notificationType)">
                <mat-icon>{{ getIcon(n.notificationType) }}</mat-icon>
              </div>
              <div class="noti-content">
                <h4>{{ n.title }}</h4>
                <p>{{ n.message }}</p>
                <span class="noti-time">{{ getRelativeTime(n.createdAt) }}</span>
              </div>
              <button mat-icon-button class="delete-btn" (click)="deleteNotification(n, $event)" matTooltip="Dismiss notification" aria-label="Dismiss notification">
                <mat-icon>close</mat-icon>
              </button>
            </mat-card-content>
          </mat-card>
        }
      </div>
    }
    </div>
  `,
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent implements OnInit {
  private notificationService = inject(NotificationService);

  notifications: Notification[] = [];
  unreadNotifications: Notification[] = [];
  loading = true;

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading = true;
    this.notificationService.getNotifications({ pageSize: 50 }).subscribe({
      next: (res) => {
        this.notifications = res.items;
        this.unreadNotifications = res.items.filter((n) => !n.isRead);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  markAsRead(notification: Notification): void {
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id).subscribe(() => {
        notification.isRead = true;
        this.unreadNotifications = this.unreadNotifications.filter((n) => n.id !== notification.id);
      });
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe(() => {
      this.notifications.forEach((n) => (n.isRead = true));
      this.unreadNotifications = [];
    });
  }

  deleteNotification(notification: Notification, event: Event): void {
    event.stopPropagation();
    this.notificationService.deleteNotification(notification.id).subscribe(() => {
      this.notifications = this.notifications.filter((n) => n.id !== notification.id);
      this.unreadNotifications = this.unreadNotifications.filter((n) => n.id !== notification.id);
    });
  }

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      'Info': 'info',
      'Warning': 'warning',
      'Reminder': 'alarm',
      'Alert': 'error',
    };
    return icons[type] || 'notifications';
  }

  getIconClass(type: string): string {
    const classes: Record<string, string> = {
      'Info': 'blue',
      'Warning': 'gold',
      'Reminder': 'blue',
      'Alert': 'red',
    };
    return classes[type] || 'gray';
  }

  getRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }
}
