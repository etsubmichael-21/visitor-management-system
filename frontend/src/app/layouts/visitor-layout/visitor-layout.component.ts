import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRippleModule } from '@angular/material/core';
import { Subject, takeUntil, switchMap, of, catchError, finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { VisitorService } from '../../core/services/visitor.service';
import { User } from '../../core/models/auth.model';
import { Notification } from '../../core/models/notification.model';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';

@Component({
  selector: 'app-visitor-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatMenuModule,
    MatBadgeModule,
    MatTooltipModule,
    MatDividerModule,
    MatProgressBarModule,
    MatRippleModule,
    RelativeTimePipe,
  ],
  template: `
    <div class="visitor-layout">
      <mat-toolbar class="visitor-toolbar">
        <button mat-icon-button (click)="sidenav.toggle()" class="menu-toggle-btn" aria-label="Toggle navigation menu">
          <mat-icon>menu</mat-icon>
        </button>

        <a routerLink="/dashboard" class="toolbar-brand">
          <img src="assets/images/ecx-logo.png" alt="ECX Logo" class="brand-logo">
          <span class="brand-text">ECX <span class="accent">Visitor Portal</span></span>
        </a>

        <span class="toolbar-spacer"></span>

        <!-- Notification Bell with Dropdown -->
        <button
          mat-icon-button
          [matMenuTriggerFor]="notifMenu"
          class="notification-btn"
          [matBadge]="badgeDisplay"
          [matBadgeHidden]="unreadCount === 0"
          matBadgeColor="warn"
          matBadgeSize="small"
          matBadgeOverlap="false"
          matBadgePosition="above after"
          matTooltip="Notifications"
          (menuOpened)="onNotifPanelOpen()"
          aria-label="Open notifications panel">
          <mat-icon [class.has-unread]="unreadCount > 0">notifications</mat-icon>
        </button>

        <mat-menu
          #notifMenu="matMenu"
          class="notif-panel-menu"
          [hasBackdrop]="true"
          xPosition="before"
          yPosition="below"
          overlapTrigger="false">

          <div class="notif-panel" (click)="$event.stopPropagation()">
            <!-- Panel Header -->
            <div class="notif-panel-header">
              <div class="notif-header-left">
                <mat-icon class="notif-header-icon">notifications_active</mat-icon>
                <span class="notif-header-title">Notifications</span>
                @if (unreadCount > 0) {
                  <span class="notif-unread-badge">{{ unreadCount }}</span>
                }
              </div>
              @if (unreadCount > 0) {
                <button
                  mat-button
                  class="mark-all-btn"
                  (click)="markAllRead($event)"
                  [disabled]="markingAllRead">
                  <mat-icon>done_all</mat-icon>
                  Mark all read
                </button>
              }
            </div>

            <mat-divider></mat-divider>

            <!-- Loading State -->
            @if (loadingNotifications) {
              <div class="notif-loading">
                <mat-progress-bar mode="indeterminate"></mat-progress-bar>
              </div>
            }

            <!-- Empty State -->
            @if (!loadingNotifications && panelNotifications.length === 0) {
              <div class="notif-empty">
                <mat-icon class="notif-empty-icon">notifications_none</mat-icon>
                <span class="notif-empty-text">No notifications yet</span>
                <span class="notif-empty-sub">You're all caught up!</span>
              </div>
            }

            <!-- Notification List -->
            @if (!loadingNotifications && panelNotifications.length > 0) {
              <div class="notif-list">
                @for (notif of panelNotifications; track notif.id) {
                  <div
                    class="notif-item"
                    [class.unread]="!notif.isRead"
                    (click)="onNotifClick(notif, $event)"
                    matRipple>
                    <div class="notif-item-icon-wrap" [class]="'notif-type-' + notif.notificationType.toLowerCase()">
                      <mat-icon class="notif-item-icon">{{ getNotifIcon(notif.notificationType) }}</mat-icon>
                    </div>
                    <div class="notif-item-content">
                      <div class="notif-item-header">
                        <span class="notif-item-title">{{ notif.title }}</span>
                        @if (!notif.isRead) {
                          <span class="notif-dot"></span>
                        }
                      </div>
                      <span class="notif-item-message">{{ notif.message }}</span>
                      <span class="notif-item-time">{{ notif.createdAt | relativeTime }}</span>
                    </div>
                  </div>
                }
              </div>
            }

            <mat-divider></mat-divider>

            <!-- Panel Footer -->
            <div class="notif-panel-footer">
              <button mat-button class="view-all-btn" routerLink="/notifications">
                <mat-icon>open_in_new</mat-icon>
                View All Notifications
              </button>
            </div>
          </div>
        </mat-menu>

        <!-- Account Avatar with Dropdown -->
        <button
          mat-icon-button
          [matMenuTriggerFor]="accountMenu"
          class="account-btn"
          matTooltip="Account"
          aria-label="Open account menu">
          <div class="avatar-circle" [class]="'avatar-size-' + avatarSize">
            @if (profilePhotoUrl) {
              <img [src]="profilePhotoUrl" alt="Profile">
            } @else {
              <span class="avatar-initials">{{ userInitials }}</span>
            }
          </div>
        </button>

        <mat-menu #accountMenu="matMenu" class="account-panel-menu" xPosition="before" yPosition="below">
          <div class="account-panel" (click)="$event.stopPropagation()">
            <!-- User Info Header -->
            <div class="account-header">
              <div class="account-avatar-lg">
                @if (profilePhotoUrl) {
                  <img [src]="profilePhotoUrl" alt="Profile">
                } @else {
                  <span class="account-initials-lg">{{ userInitials }}</span>
                }
              </div>
              <div class="account-info">
                <span class="account-name">{{ user?.firstName }} {{ user?.lastName }}</span>
                <span class="account-email">{{ user?.email }}</span>
              </div>
            </div>

            <mat-divider></mat-divider>

            <!-- Menu Items -->
            <div class="account-menu-items">
              <a mat-menu-item routerLink="/profile" class="account-menu-item">
                <mat-icon class="menu-item-icon">person_outline</mat-icon>
                <span>My Profile</span>
              </a>
              <a mat-menu-item routerLink="/profile" [queryParams]="{ edit: true }" class="account-menu-item">
                <mat-icon class="menu-item-icon">edit</mat-icon>
                <span>Edit Profile</span>
              </a>
              <a mat-menu-item routerLink="/profile/change-password" class="account-menu-item">
                <mat-icon class="menu-item-icon">lock_outline</mat-icon>
                <span>Change Password</span>
              </a>

              <mat-divider></mat-divider>

              <button mat-menu-item (click)="logout()" class="account-menu-item signout-item">
                <mat-icon class="menu-item-icon signout-icon">logout</mat-icon>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </mat-menu>
      </mat-toolbar>

      <mat-sidenav-container class="visitor-sidenav-container">
        <mat-sidenav #sidenav [mode]="sidenavMode" [opened]="sidenavOpened" class="visitor-sidenav">
          <div class="sidenav-header">
            <img src="assets/images/ecx-logo.png" alt="ECX Logo" class="sidebar-logo">
            <div class="sidenav-user-wrap">
              @if (profilePhotoUrl) {
                <div class="sidenav-avatar">
                  <img [src]="profilePhotoUrl" alt="Profile">
                </div>
              }
              <div class="user-info">
                <div class="user-name">{{ user?.firstName }} {{ user?.lastName }}</div>
                <div class="user-email">{{ user?.email }}</div>
              </div>
            </div>
          </div>

          <mat-divider></mat-divider>

          <mat-nav-list>
            <a mat-list-item routerLink="/dashboard" routerLinkActive="active-nav" (click)="closeSidenavMobile()">
              <mat-icon matListItemIcon>dashboard</mat-icon>
              <span matListItemTitle>Dashboard</span>
            </a>
            <a mat-list-item routerLink="/appointments" routerLinkActive="active-nav" (click)="closeSidenavMobile()">
              <mat-icon matListItemIcon>event</mat-icon>
              <span matListItemTitle>My Appointments</span>
            </a>
            <a mat-list-item routerLink="/appointments/new" routerLinkActive="active-nav" (click)="closeSidenavMobile()">
              <mat-icon matListItemIcon>add_circle</mat-icon>
              <span matListItemTitle>Request Appointment</span>
            </a>
            <a mat-list-item routerLink="/visits" routerLinkActive="active-nav" (click)="closeSidenavMobile()">
              <mat-icon matListItemIcon>history</mat-icon>
              <span matListItemTitle>Visit History</span>
            </a>
            <a mat-list-item routerLink="/notifications" routerLinkActive="active-nav" (click)="closeSidenavMobile()">
              <mat-icon matListItemIcon>notifications</mat-icon>
              <span matListItemTitle>Notifications</span>
            </a>
            <a mat-list-item routerLink="/profile" routerLinkActive="active-nav" (click)="closeSidenavMobile()">
              <mat-icon matListItemIcon>person</mat-icon>
              <span matListItemTitle>My Profile</span>
            </a>
            <a mat-list-item routerLink="/profile/change-password" routerLinkActive="active-nav" (click)="closeSidenavMobile()">
              <mat-icon matListItemIcon>lock</mat-icon>
              <span matListItemTitle>Change Password</span>
            </a>
          </mat-nav-list>

          <mat-divider></mat-divider>

          <mat-nav-list>
            <a mat-list-item (click)="logout(); closeSidenavMobile()">
              <mat-icon matListItemIcon>logout</mat-icon>
              <span matListItemTitle>Sign Out</span>
            </a>
          </mat-nav-list>
        </mat-sidenav>

        <mat-sidenav-content class="visitor-content">
          <router-outlet />
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styleUrls: ['./visitor-layout.component.scss'],
})
export class VisitorLayoutComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private visitorService = inject(VisitorService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  user: User | null = null;
  unreadCount = 0;
  sidenavMode: 'side' | 'over' = 'side';
  sidenavOpened = true;
  profilePhotoUrl: string | null = null;

  panelNotifications: Notification[] = [];
  loadingNotifications = false;
  markingAllRead = false;

  get userInitials(): string {
    if (!this.user) return '?';
    const f = this.user.firstName?.[0] || '';
    const l = this.user.lastName?.[0] || '';
    return (f + l).toUpperCase() || '?';
  }

  get avatarSize(): string {
    return this.userInitials.length > 2 ? 'lg' : 'sm';
  }

  get badgeDisplay(): string {
    return this.unreadCount > 99 ? '99+' : String(this.unreadCount);
  }

  ngOnInit(): void {
    this.user = this.authService.currentUser;
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      this.user = user;
      this.cdr.markForCheck();
    });

    this.visitorService.profile$.pipe(takeUntil(this.destroy$)).subscribe((profile) => {
      this.profilePhotoUrl = profile ? this.visitorService.resolvePhotoUrl(profile.photoUrl) : null;
      this.cdr.markForCheck();
    });
    this.visitorService.getProfile().pipe(takeUntil(this.destroy$)).subscribe({ error: () => {} });

    const visitorId = this.user?.visitorId;
    if (visitorId) {
      this.notificationService.pollVisitorUnreadCount(visitorId).pipe(takeUntil(this.destroy$)).subscribe((count) => {
        this.unreadCount = count.count;
        this.cdr.markForCheck();
      });
    }

    this.notificationService.refreshUnreadCount$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.refreshUnreadCount();
    });

    this.checkScreenSize();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.checkScreenSize);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.checkScreenSize);
    }
  }

  checkScreenSize = (): void => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      this.sidenavMode = 'over';
      this.sidenavOpened = false;
    } else {
      this.sidenavMode = 'side';
      this.sidenavOpened = true;
    }
    this.cdr.markForCheck();
  };

  closeSidenavMobile(): void {
    if (this.sidenavMode === 'over') {
      this.sidenavOpened = false;
      this.cdr.markForCheck();
    }
  }

  onNotifPanelOpen(): void {
    this.loadingNotifications = true;
    this.cdr.markForCheck();
    const visitorId = this.user?.visitorId;
    if (!visitorId) {
      this.panelNotifications = [];
      this.loadingNotifications = false;
      this.cdr.markForCheck();
      return;
    }
    this.notificationService
      .getVisitorNotifications(visitorId, { page: 1, pageSize: 5 })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loadingNotifications = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (res) => {
          this.panelNotifications = res.items || [];
          this.cdr.markForCheck();
        },
        error: () => {
          this.panelNotifications = [];
          this.cdr.markForCheck();
        },
      });
  }

  onNotifClick(notif: Notification, event: Event): void {
    event.stopPropagation();
    if (!notif.isRead) {
      const visitorId = this.user?.visitorId;
      if (!visitorId) return;
      this.notificationService.markVisitorNotificationRead(visitorId, notif.id).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          notif.isRead = true;
          this.unreadCount = Math.max(0, this.unreadCount - 1);
          this.cdr.markForCheck();
        },
        error: () => {},
      });
    }
  }

  markAllRead(event: Event): void {
    event.stopPropagation();
    const visitorId = this.user?.visitorId;
    if (!visitorId) return;
    this.markingAllRead = true;
    this.cdr.markForCheck();
    this.notificationService.markAllVisitorNotificationsRead(visitorId).pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.markingAllRead = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: () => {
        this.panelNotifications.forEach((n) => (n.isRead = true));
        this.unreadCount = 0;
        this.cdr.markForCheck();
      },
      error: () => {},
    });
  }

  getNotifIcon(type: string): string {
    switch (type) {
      case 'Info': return 'info';
      case 'Warning': return 'warning';
      case 'Reminder': return 'schedule';
      case 'Alert': return 'error_outline';
      default: return 'notifications';
    }
  }

  logout(): void {
    this.authService.logout();
  }

  refreshUnreadCount(): void {
    const visitorId = this.user?.visitorId;
    if (!visitorId) return;
    this.notificationService
      .getVisitorUnreadCount(visitorId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (count) => {
          this.unreadCount = count.count;
          this.cdr.markForCheck();
        },
        error: () => {
          this.unreadCount = 0;
          this.cdr.markForCheck();
        },
      });
  }
}
