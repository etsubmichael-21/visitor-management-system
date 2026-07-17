import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
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
import { Subscription, interval, switchMap } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { UserRole } from '../../core/models/auth.model';
import { Notification } from '../../core/models/notification.model';

interface NavItem {
  icon: string;
  label: string;
  route: string;
  roles: UserRole[];
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive,
    MatSidenavModule, MatToolbarModule, MatIconModule, MatButtonModule,
    MatListModule, MatMenuModule, MatBadgeModule, MatTooltipModule, MatDividerModule
  ],
  template: `
    <mat-sidenav-container class="layout-container">
      <mat-sidenav #sidenav [mode]="sidenavMode" [opened]="sidenavOpened" class="ecx-sidebar">
        <div class="sidebar-header">
          <div class="logo-area">
            <mat-icon class="logo-icon">apartment</mat-icon>
            <div>
              <h2 class="logo-title">ECX</h2>
              <span class="portal-label">Employee Portal</span>
            </div>
          </div>
          <div class="brand-accent"></div>
        </div>

        <div class="user-card" *ngIf="currentUser()">
          <div class="avatar">{{ userInitials() }}</div>
          <div class="user-info">
            <span class="user-name">{{ currentUser()!.fullName }}</span>
            <span class="user-role">{{ currentUser()!.role }}</span>
          </div>
        </div>

        <mat-nav-list class="sidebar-nav">
          @for (item of filteredNavItems(); track item.route) {
            <a mat-list-item [routerLink]="item.route" routerLinkActive="active-link"
               [routerLinkActiveOptions]="{exact: item.route.endsWith('dashboard')}" matTooltip="{{ item.label }}">
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.label }}</span>
            </a>
          }
        </mat-nav-list>

        <div class="sidebar-footer">
          <a mat-list-item routerLink="/settings" routerLinkActive="active-link">
            <mat-icon matListItemIcon>settings</mat-icon>
            <span matListItemTitle>Settings</span>
          </a>
          <a mat-list-item (click)="logout()">
            <mat-icon matListItemIcon>logout</mat-icon>
            <span matListItemTitle>Logout</span>
          </a>
        </div>
      </mat-sidenav>

      <mat-sidenav-content class="main-content">
        <mat-toolbar class="top-toolbar" color="primary">
          <button mat-icon-button (click)="toggleSidenav()" matTooltip="Toggle menu" aria-label="Toggle navigation menu">
            <mat-icon>menu</mat-icon>
          </button>
          <span class="page-title">{{ pageTitle() }}</span>
          <span class="toolbar-spacer"></span>

          <button mat-icon-button [matMenuTriggerFor]="notifMenu"
                  class="notification-bell"
                  [matBadge]="unreadCount()" matBadgeColor="warn"
                  [matBadgeHidden]="unreadCount() === 0" matBadgeSize="small"
                  matTooltip="Notifications" aria-label="Open notifications menu">
            <mat-icon>notifications</mat-icon>
          </button>
          <mat-menu #notifMenu="matMenu" class="notif-menu" xPosition="before">
            <div class="notif-header">
              <span class="notif-title">Notifications</span>
              <button mat-button color="primary" class="mark-read-btn"
                      (click)="markAllRead(); $event.stopPropagation()"
                      [disabled]="unreadCount() === 0">
                Mark all read
              </button>
            </div>
            <mat-divider></mat-divider>
            @if (recentNotifications().length === 0) {
              <div class="notif-empty">
                <mat-icon>notifications_off</mat-icon>
                <span>No unread notifications</span>
              </div>
            } @else {
              @for (notif of recentNotifications(); track notif.id) {
                <button mat-menu-item class="notif-item" (click)="onNotificationClick(notif)">
                  <div class="notif-item-content">
                    <mat-icon class="notif-item-icon" [class]="'notif-type-' + notif.notificationType.toLowerCase()">
                      {{ getNotificationIcon(notif.notificationType) }}
                    </mat-icon>
                    <div class="notif-item-text">
                      <span class="notif-item-title">{{ notif.title }}</span>
                      <span class="notif-item-message">{{ notif.message | slice:0:60 }}{{ notif.message.length > 60 ? '...' : '' }}</span>
                      <span class="notif-item-time">{{ getTimeAgo(notif.createdAt) }}</span>
                    </div>
                  </div>
                </button>
              }
            }
            <mat-divider></mat-divider>
            <button mat-menu-item class="notif-view-all" routerLink="/notifications">
              <mat-icon>arrow_forward</mat-icon>
              <span>View All Notifications</span>
            </button>
          </mat-menu>

          <button mat-icon-button [matMenuTriggerFor]="userMenu" matTooltip="Account" aria-label="Open account menu">
            <mat-icon>account_circle</mat-icon>
          </button>
          <mat-menu #userMenu="matMenu">
            <div class="menu-user-info" *ngIf="currentUser()">
              <strong>{{ currentUser()!.fullName }}</strong>
              <small>{{ currentUser()!.email }}</small>
            </div>
            <mat-divider></mat-divider>
            <button mat-menu-item routerLink="/settings">
              <mat-icon>settings</mat-icon>
              <span>Settings</span>
            </button>
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              <span>Logout</span>
            </button>
          </mat-menu>
        </mat-toolbar>

        <div class="content-area">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    :host { display: block; height: 100vh; }
    .layout-container { height: 100vh; }
    .ecx-sidebar {
      width: 260px;
      background: linear-gradient(180deg, #1a237e 0%, #0d1b5e 100%);
      color: white;
      border: none;
    }
    .sidebar-header {
      padding: 20px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      position: relative;
      overflow: hidden;
    }
    .brand-accent {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #f9a825, #2e7d32, #f9a825);
    }
    .logo-area {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: #f9a825;
      background: rgba(249,168,37,0.15);
      border-radius: 10px;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .logo-title {
      font-size: 22px;
      font-weight: 700;
      margin: 0;
      color: white;
      letter-spacing: 2px;
    }
    .portal-label { font-size: 11px; color: rgba(255,255,255,0.6); display: block; margin-top: 2px; }
    .user-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #f9a825;
      color: #1a237e;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
    }
    .user-info { display: flex; flex-direction: column; }
    .user-name { font-size: 14px; font-weight: 500; color: white; }
    .user-role { font-size: 11px; color: rgba(255,255,255,0.6); }
    .sidebar-nav {
      padding: 8px 0;
      flex: 1;
      overflow-y: auto;
    }
    .sidebar-nav a {
      color: rgba(255,255,255,0.8);
      margin: 2px 8px;
      border-radius: 8px;
      height: 44px;
    }
    .sidebar-nav a:hover {
      background: rgba(255,255,255,0.1);
      color: white;
    }
    .sidebar-nav .active-link {
      background: rgba(249,168,37,0.2) !important;
      color: #f9a825 !important;
    }
    .sidebar-footer {
      border-top: 1px solid rgba(255,255,255,0.1);
      padding: 8px 0;
    }
    .sidebar-footer a {
      color: rgba(255,255,255,0.8);
      margin: 2px 8px;
      border-radius: 8px;
      height: 44px;
    }
    .sidebar-footer a:hover {
      background: rgba(255,255,255,0.1);
      color: white;
    }
    .top-toolbar {
      background: white;
      color: #333;
      box-shadow: 0 1px 4px rgba(0,0,0,0.1);
      position: sticky;
      top: 0;
      z-index: 10;
    }
    .page-title {
      font-size: 18px;
      font-weight: 500;
      margin-left: 8px;
    }
    .toolbar-spacer { flex: 1; }
    .content-area {
      padding: 24px;
      background: #f5f5f5;
      min-height: calc(100vh - 64px);
    }
    .notification-bell {
      color: #f9a825 !important;
      position: relative;
    }
    .notification-bell mat-icon {
      color: #f9a825;
    }
    .notif-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px 8px;
    }
    .notif-title {
      font-weight: 600;
      font-size: 15px;
      color: #333;
    }
    .mark-read-btn {
      font-size: 12px !important;
      line-height: 1 !important;
    }
    .notif-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px 16px;
      color: #999;
      gap: 8px;
    }
    .notif-empty mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #ccc;
    }
    .notif-empty span { font-size: 13px; }
    .notif-item { height: auto !important; padding: 8px 16px !important; }
    .notif-item-content {
      display: flex;
      gap: 10px;
      width: 100%;
    }
    .notif-item-icon {
      flex-shrink: 0;
      font-size: 20px;
      width: 20px;
      height: 20px;
      margin-top: 2px;
    }
    .notif-type-info { color: #1565c0; }
    .notif-type-warning { color: #f57f17; }
    .notif-type-reminder { color: #2e7d32; }
    .notif-type-alert { color: #c62828; }
    .notif-item-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }
    .notif-item-title {
      font-size: 13px;
      font-weight: 500;
      color: #333;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .notif-item-message {
      font-size: 12px;
      color: #666;
      line-height: 1.3;
    }
    .notif-item-time {
      font-size: 11px;
      color: #999;
    }
    .notif-view-all {
      color: #1a237e !important;
      font-weight: 500;
      justify-content: center;
    }
    .notif-view-all mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      margin-right: 4px;
    }
    .menu-user-info {
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
    }
    .menu-user-info strong { font-size: 14px; }
    .menu-user-info small { font-size: 12px; color: #666; }
    @media (max-width: 768px) {
      .content-area { padding: 16px; }
    }
  `]
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  sidenavOpened = true;
  sidenavMode: 'side' | 'over' = 'side';

  currentUser = signal(this.authService.getCurrentUser());
  unreadCount = signal(0);
  recentNotifications = signal<Notification[]>([]);

  private pollingSub?: Subscription;

  allNavItems: NavItem[] = [
    { icon: 'dashboard', label: 'Dashboard', route: '', roles: ['Admin', 'CEO', 'DepartmentHead', 'Employee', 'Receptionist', 'Security'] },
    { icon: 'calendar_today', label: 'Calendar', route: '/calendar', roles: ['Admin', 'CEO', 'DepartmentHead', 'Employee'] },
    { icon: 'people', label: 'Employees', route: '/employees', roles: ['Admin', 'DepartmentHead'] },
    { icon: 'person_add', label: 'Visitors', route: '/visitors', roles: ['Admin'] },
    { icon: 'domain', label: 'Departments', route: '/departments', roles: ['Admin', 'CEO'] },
    { icon: 'manage_accounts', label: 'Users', route: '/users', roles: ['Admin'] },
    { icon: 'event', label: 'Appointments', route: '/appointments', roles: ['Admin', 'CEO', 'DepartmentHead', 'Employee'] },
    { icon: 'fact_check', label: 'Check-In', route: '/check-in', roles: ['Receptionist'] },
    { icon: 'note_add', label: 'Walk-In', route: '/walk-in', roles: ['Receptionist'] },
    { icon: 'today', label: 'Today\'s Appointments', route: '/today', roles: ['Receptionist'] },
    { icon: 'how_to_reg', label: 'Verify', route: '/verify', roles: ['Security'] },
    { icon: 'logout', label: 'Check-Out', route: '/check-out', roles: ['Security'] },
    { icon: 'visibility', label: 'Active Visitors', route: '/active', roles: ['Security'] },
    { icon: 'assessment', label: 'Reports', route: '/reports', roles: ['Admin', 'CEO'] },
  ];

  private dashboardRoutes: Record<UserRole, string> = {
    'Admin': '/admin/dashboard',
    'CEO': '/ceo/dashboard',
    'DepartmentHead': '/dept/dashboard',
    'Employee': '/emp/dashboard',
    'Receptionist': '/reception/dashboard',
    'Security': '/security/dashboard',
  };

  private roleRoutePrefix: Record<UserRole, string> = {
    'Admin': '/admin',
    'CEO': '/ceo',
    'DepartmentHead': '/dept',
    'Employee': '/emp',
    'Receptionist': '/reception',
    'Security': '/security',
  };

  filteredNavItems = computed(() => {
    const user = this.currentUser();
    if (!user) return [];
    return this.allNavItems
      .filter(item => item.roles.includes(user.role))
      .map(item => {
        if (item.label === 'Dashboard') {
          return { ...item, route: this.dashboardRoutes[user.role] };
        }
        const prefix = this.roleRoutePrefix[user.role];
        const baseRoute = item.route;
        return { ...item, route: prefix + baseRoute };
      });
  });

  pageTitle = computed(() => {
    const url = this.router.url;
    const segments = url.split('/').filter(s => s);
    const lastSegment = segments[segments.length - 1];
    if (!lastSegment) return 'Dashboard';
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, ' ');
  });

  ngOnInit(): void {
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
    this.loadUnreadCount();
    this.loadRecentNotifications();
    this.pollingSub = interval(30000).pipe(
      switchMap(() => this.notificationService.getUnreadCount())
    ).subscribe({
      next: (res) => {
        if (res.success) this.unreadCount.set(res.data);
      }
    });
  }

  ngOnDestroy(): void {
    this.pollingSub?.unsubscribe();
    window.removeEventListener('resize', () => this.checkScreenSize());
  }

  private checkScreenSize(): void {
    if (window.innerWidth < 768) {
      this.sidenavMode = 'over';
      this.sidenavOpened = false;
    } else {
      this.sidenavMode = 'side';
      this.sidenavOpened = true;
    }
  }

  private loadUnreadCount(): void {
    this.notificationService.getUnreadCount().subscribe({
      next: (res) => {
        if (res.success) this.unreadCount.set(res.data);
      }
    });
  }

  private loadRecentNotifications(): void {
    this.notificationService.getAll({ isRead: false, page: 1, limit: 5 }).subscribe({
      next: (res) => {
        if (res.success && res.data.items) {
          this.recentNotifications.set(res.data.items.slice(0, 5));
        }
      }
    });
  }

  toggleSidenav(): void {
    this.sidenavOpened = !this.sidenavOpened;
  }

  markAllRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.unreadCount.set(0);
        this.recentNotifications.set([]);
      }
    });
  }

  onNotificationClick(notif: Notification): void {
    this.notificationService.markAsRead(notif.id).subscribe({
      next: () => {
        this.recentNotifications.update(n => n.filter(item => item.id !== notif.id));
        this.unreadCount.update(c => Math.max(0, c - 1));
      }
    });
  }

  getNotificationIcon(type: string): string {
    const icons: Record<string, string> = {
      'Info': 'info',
      'Warning': 'warning',
      'Reminder': 'schedule',
      'Alert': 'error'
    };
    return icons[type] || 'notifications';
  }

  getTimeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }

  logout(): void {
    this.authService.logout();
  }

  userInitials(): string {
    const user = this.currentUser();
    if (!user) return '';
    return user.fullName ? user.fullName.split(' ').map(n => n.charAt(0)).join('').toUpperCase() : '';
  }
}
