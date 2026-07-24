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
  styleUrls: ['./notifications.component.scss']
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
          this.unreadCount.set(res.data.count);
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
      Warning: '#D4A017',
      Reminder: '#0F6B3A',
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
