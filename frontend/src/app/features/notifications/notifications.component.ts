import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { Notification } from '../../core/models/notification.model';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    RelativeTimePipe,
  ],
  template: `
    <div class="notifications-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Notifications</h1>
          <p class="page-subtitle">Stay updated on your appointments and visits</p>
        </div>
        @if (!loading && notifications.length > 0 && unreadCount > 0) {
          <button mat-stroked-button color="primary" (click)="markAllAsRead()" [disabled]="markingAllRead" class="mark-all-btn">
            @if (markingAllRead) {
              <mat-spinner diameter="16"></mat-spinner>
            } @else {
              <mat-icon>done_all</mat-icon>
            }
            Mark All Read
          </button>
        }
      </div>

      @if (loading) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (errorMessage) {
        <div class="error-state">
          <mat-icon class="error-icon">error_outline</mat-icon>
          <h3>Something went wrong</h3>
          <p>{{ errorMessage }}</p>
          <button mat-stroked-button color="primary" (click)="loadNotifications()">
            <mat-icon>refresh</mat-icon>
            Try Again
          </button>
        </div>
      } @else if (notifications.length === 0) {
        <div class="empty-state">
          <mat-icon class="empty-icon">notifications_none</mat-icon>
          <h3>No Notifications</h3>
          <p>You're all caught up! Notifications about your appointments will appear here.</p>
        </div>
      } @else {
        <div class="notifications-list">
          @for (n of notifications; track n.id) {
            <mat-card
              class="notification-card"
              [class.unread]="!n.isRead"
              (click)="markAsRead(n)"
              matRipple>
              <mat-card-content>
                <div class="noti-icon" [class]="'noti-icon-' + n.notificationType.toLowerCase()">
                  <mat-icon>{{ getIcon(n.notificationType) }}</mat-icon>
                </div>
                <div class="noti-content">
                  <div class="noti-title-row">
                    <h4>{{ n.title }}</h4>
                    @if (!n.isRead) {
                      <span class="unread-dot"></span>
                    }
                  </div>
                  <p class="noti-message">{{ n.message }}</p>
                  <span class="noti-time">{{ n.createdAt | relativeTime }}</span>
                </div>
                <button
                  mat-icon-button
                  class="dismiss-btn"
                  (click)="deleteNotification(n, $event)"
                  matTooltip="Dismiss"
                  aria-label="Dismiss notification">
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
export class NotificationsComponent implements OnInit, OnDestroy {
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  private destroy$ = new Subject<void>();

  notifications: Notification[] = [];
  unreadCount = 0;
  loading = true;
  errorMessage = '';
  markingAllRead = false;

  ngOnInit(): void {
    this.loadNotifications();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadNotifications(): void {
    this.loading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    const visitorId = this.authService.currentUser?.visitorId;
    if (!visitorId) {
      this.errorMessage = 'You must be logged in to view notifications.';
      this.loading = false;
      this.cdr.markForCheck();
      return;
    }

    this.notificationService.getVisitorNotifications(visitorId, { pageSize: 50 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.notifications = res.items || [];
          this.unreadCount = this.notifications.filter(n => !n.isRead).length;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.errorMessage = err?.message || 'Failed to load notifications. Please try again.';
          this.notifications = [];
          this.unreadCount = 0;
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  markAsRead(notification: Notification): void {
    if (notification.isRead) return;
    const visitorId = this.authService.currentUser?.visitorId;
    if (!visitorId) return;

    this.notificationService.markVisitorNotificationRead(visitorId, notification.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          notification.isRead = true;
          this.unreadCount = Math.max(0, this.unreadCount - 1);
          this.cdr.markForCheck();
        },
        error: () => {},
      });
  }

  markAllAsRead(): void {
    const visitorId = this.authService.currentUser?.visitorId;
    if (!visitorId) return;

    this.markingAllRead = true;
    this.cdr.markForCheck();

    this.notificationService.markAllVisitorNotificationsRead(visitorId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notifications.forEach(n => (n.isRead = true));
          this.unreadCount = 0;
          this.markingAllRead = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.markingAllRead = false;
          this.cdr.markForCheck();
        },
      });
  }

  deleteNotification(notification: Notification, event: Event): void {
    event.stopPropagation();
    this.notificationService.deleteNotification(notification.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notifications = this.notifications.filter(n => n.id !== notification.id);
          if (!notification.isRead) {
            this.unreadCount = Math.max(0, this.unreadCount - 1);
          }
          this.cdr.markForCheck();
        },
        error: () => {},
      });
  }

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      'Info': 'info',
      'Warning': 'warning',
      'Reminder': 'schedule',
      'Alert': 'error_outline',
    };
    return icons[type] || 'notifications';
  }
}
