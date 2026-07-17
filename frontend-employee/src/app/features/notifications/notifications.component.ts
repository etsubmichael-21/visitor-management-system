import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NotificationService } from '../../core/services/notification.service';
import { Notification, NotificationType, NotificationPriority } from '../../core/models/notification.model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatIconModule, MatButtonModule,
    MatTabsModule, MatBadgeModule, MatMenuModule, MatTooltipModule
  ],
  template: `
    <div class="notifications-page">
      <div class="page-header">
        <div class="header-left">
          <h1>Notifications</h1>
          @if (unreadCount() > 0) {
            <span class="unread-badge">{{ unreadCount() }} unread</span>
          }
        </div>
        <button mat-stroked-button color="primary" (click)="markAllRead()" [disabled]="unreadCount() === 0">
          <mat-icon>done_all</mat-icon> Mark All as Read
        </button>
      </div>

      <mat-card class="notifications-card">
        <mat-tab-group animationDuration="200ms" (selectedIndexChange)="onTabChange($event)">
          <mat-tab>
            <ng-template mat-tab-label>
              <span [matBadge]="unreadCount()" [matBadgeHidden]="unreadCount() === 0" matBadgeColor="warn" matBadgeSize="small">
                Unread
              </span>
            </ng-template>
            <div class="notification-list">
              @for (notif of unreadNotifications(); track notif.id) {
                <div class="notification-item unread" (click)="handleNotificationClick(notif)">
                  <div class="notif-icon-wrapper" [style.background]="getTypeColor(notif.notificationType) + '18'" [style.color]="getTypeColor(notif.notificationType)">
                    <mat-icon>{{ getTypeIcon(notif.notificationType) }}</mat-icon>
                  </div>
                  <div class="notif-content">
                    <div class="notif-header">
                      <strong class="notif-title">{{ notif.title }}</strong>
                      <span class="priority-badge" [class]="'priority-' + notif.priority.toLowerCase()">{{ notif.priority }}</span>
                    </div>
                    <p class="notif-message">{{ notif.message }}</p>
                    <div class="notif-footer">
                      <span class="notif-time">
                        <mat-icon class="time-icon">schedule</mat-icon>
                        {{ getTimeAgo(notif.createdAt) }}
                      </span>
                    </div>
                  </div>
                  <div class="notif-actions">
                    <div class="unread-indicator"></div>
                    <button mat-icon-button [matMenuTriggerFor]="menu" (click)="$event.stopPropagation()" class="more-btn">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #menu="matMenu">
                      <button mat-menu-item (click)="handleNotificationClick(notif)">
                        <mat-icon>mark_email_read</mat-icon>Mark as Read
                      </button>
                      <button mat-menu-item (click)="deleteNotification(notif)" class="delete-menu-item">
                        <mat-icon color="warn">delete</mat-icon>
                        <span>Delete</span>
                      </button>
                    </mat-menu>
                  </div>
                </div>
              }
              @if (!unreadNotifications().length) {
                <div class="empty-state">
                  <div class="empty-icon-wrapper">
                    <mat-icon>notifications_none</mat-icon>
                  </div>
                  <p class="empty-title">All caught up!</p>
                  <p class="empty-subtitle">No unread notifications</p>
                </div>
              }
            </div>
          </mat-tab>

          <mat-tab label="All Notifications">
            <div class="notification-list">
              @for (notif of allNotifications(); track notif.id) {
                <div class="notification-item" [class.unread]="!notif.isRead" (click)="handleNotificationClick(notif)">
                  <div class="notif-icon-wrapper" [style.background]="getTypeColor(notif.notificationType) + '18'" [style.color]="getTypeColor(notif.notificationType)">
                    <mat-icon>{{ getTypeIcon(notif.notificationType) }}</mat-icon>
                  </div>
                  <div class="notif-content">
                    <div class="notif-header">
                      <strong class="notif-title">{{ notif.title }}</strong>
                      <div class="notif-badges">
                        @if (!notif.isRead) {
                          <span class="read-status-dot" matTooltip="Unread"></span>
                        }
                        <span class="priority-badge" [class]="'priority-' + notif.priority.toLowerCase()">{{ notif.priority }}</span>
                      </div>
                    </div>
                    <p class="notif-message">{{ notif.message }}</p>
                    <div class="notif-footer">
                      <span class="notif-time">
                        <mat-icon class="time-icon">schedule</mat-icon>
                        {{ getTimeAgo(notif.createdAt) }}
                      </span>
                    </div>
                  </div>
                  <div class="notif-actions">
                    <button mat-icon-button [matMenuTriggerFor]="allMenu" (click)="$event.stopPropagation()" class="more-btn">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #allMenu="matMenu">
                      @if (!notif.isRead) {
                        <button mat-menu-item (click)="handleNotificationClick(notif)">
                          <mat-icon>mark_email_read</mat-icon>Mark as Read
                        </button>
                      } @else {
                        <button mat-menu-item disabled>
                          <mat-icon>mark_email_read</mat-icon>Already read
                        </button>
                      }
                      <button mat-menu-item (click)="deleteNotification(notif)" class="delete-menu-item">
                        <mat-icon color="warn">delete</mat-icon>
                        <span>Delete</span>
                      </button>
                    </mat-menu>
                  </div>
                </div>
              }
              @if (!allNotifications().length) {
                <div class="empty-state">
                  <div class="empty-icon-wrapper">
                    <mat-icon>notifications_none</mat-icon>
                  </div>
                  <p class="empty-title">No notifications</p>
                  <p class="empty-subtitle">You're all caught up</p>
                </div>
              }
            </div>
          </mat-tab>
        </mat-tab-group>
      </mat-card>
    </div>
  `,
  styles: [`
    .notifications-page {
      max-width: 800px;
      margin: 0 auto;
      padding: 24px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid #2e7d32;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .page-header h1 {
      font-size: 24px;
      font-weight: 600;
      color: #1b5e20;
      margin: 0;
    }

    .unread-badge {
      background: #2e7d32;
      color: white;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .page-header button {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .notifications-card {
      border-radius: 12px;
      overflow: hidden;
    }

    .notification-list {
      padding: 4px 0;
      min-height: 200px;
    }

    .notification-item {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding: 16px 20px;
      cursor: pointer;
      border-bottom: 1px solid #f0f0f0;
      transition: background 0.15s ease;
      position: relative;
    }

    .notification-item:hover {
      background: #f8f9fa;
    }

    .notification-item.unread {
      background: #e8f5e9;
    }

    .notification-item.unread:hover {
      background: #e0f2e1;
    }

    .notif-icon-wrapper {
      width: 42px;
      height: 42px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .notif-icon-wrapper mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .notif-content {
      flex: 1;
      min-width: 0;
    }

    .notif-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }

    .notif-title {
      font-size: 14px;
      font-weight: 500;
      color: #212121;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .notif-badges {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }

    .read-status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #2e7d32;
      display: inline-block;
      flex-shrink: 0;
    }

    .priority-badge {
      font-size: 10px;
      font-weight: 600;
      padding: 1px 8px;
      border-radius: 10px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      flex-shrink: 0;
    }

    .priority-low {
      background: #eeeeee;
      color: #616161;
    }

    .priority-normal {
      background: #e3f2fd;
      color: #1565c0;
    }

    .priority-high {
      background: #fff3e0;
      color: #e65100;
    }

    .priority-urgent {
      background: #ffebee;
      color: #c62828;
    }

    .notif-message {
      font-size: 13px;
      color: #555;
      margin: 0 0 6px 0;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .notif-footer {
      display: flex;
      align-items: center;
    }

    .notif-time {
      display: flex;
      align-items: center;
      gap: 3px;
      font-size: 11px;
      color: #999;
    }

    .time-icon {
      font-size: 13px;
      width: 13px;
      height: 13px;
    }

    .notif-actions {
      display: flex;
      align-items: center;
      gap: 2px;
      flex-shrink: 0;
    }

    .unread-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #2e7d32;
      flex-shrink: 0;
    }

    .more-btn {
      opacity: 0;
      transition: opacity 0.15s ease;
    }

    .notification-item:hover .more-btn {
      opacity: 1;
    }

    .delete-menu-item {
      color: #c62828;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
    }

    .empty-icon-wrapper {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
    }

    .empty-icon-wrapper mat-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
      color: #bdbdbd;
    }

    .empty-title {
      font-size: 16px;
      font-weight: 500;
      color: #424242;
      margin: 0 0 4px 0;
    }

    .empty-subtitle {
      font-size: 13px;
      color: #999;
      margin: 0;
    }

    ::ng-deep .mat-mdc-tab-group {
      --mat-tab-header-active-focus-indicator-color: #2e7d32;
      --mat-tab-header-active-hover-indicator-color: #2e7d32;
      --mat-tab-header-active-indicator-color: #2e7d32;
    }

    ::ng-deep .mat-mdc-badge-content {
      font-size: 10px;
    }
  `]
})
export class NotificationsComponent implements OnInit {
  private notificationService = inject(NotificationService);

  allNotifications = signal<Notification[]>([]);
  unreadNotifications = signal<Notification[]>([]);
  unreadCount = signal(0);

  ngOnInit(): void {
    this.loadNotifications();
    this.loadUnreadCount();
  }

  loadNotifications(): void {
    this.notificationService.getAll({}).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const items = res.data.items || [];
          this.allNotifications.set(items);
          this.unreadNotifications.set(items.filter((n: Notification) => !n.isRead));
        }
      }
    });
  }

  loadUnreadCount(): void {
    this.notificationService.getUnreadCount().subscribe({
      next: (res) => {
        if (res.success && res.data !== undefined) {
          this.unreadCount.set(res.data);
        }
      }
    });
  }

  handleNotificationClick(notif: Notification): void {
    if (!notif.isRead) {
      this.notificationService.markAsRead(notif.id).subscribe({
        next: () => {
          this.unreadCount.update(c => Math.max(0, c - 1));
          this.loadNotifications();
        }
      });
    }
  }

  markAllRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.unreadCount.set(0);
        this.loadNotifications();
      }
    });
  }

  deleteNotification(notif: Notification): void {
    this.notificationService.delete(notif.id).subscribe({
      next: () => {
        if (!notif.isRead) {
          this.unreadCount.update(c => Math.max(0, c - 1));
        }
        this.loadNotifications();
      }
    });
  }

  onTabChange(index: number): void {
    if (index === 0) {
      this.unreadNotifications.set(this.allNotifications().filter(n => !n.isRead));
    }
  }

  getTypeIcon(type: NotificationType): string {
    const icons: Record<NotificationType, string> = {
      Info: 'event',
      Warning: 'warning',
      Reminder: 'schedule',
      Alert: 'error'
    };
    return icons[type] || 'notifications';
  }

  getTypeColor(type: NotificationType): string {
    const colors: Record<NotificationType, string> = {
      Info: '#1565c0',
      Warning: '#f9a825',
      Reminder: '#2e7d32',
      Alert: '#c62828'
    };
    return colors[type] || '#666';
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;
    return date.toLocaleDateString();
  }
}
