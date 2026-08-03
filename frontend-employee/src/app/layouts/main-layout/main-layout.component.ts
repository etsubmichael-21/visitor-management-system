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
            <img src="assets/images/ecx-logo.png" alt="ECX Logo" class="sidebar-logo-img">
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
                  matBadgeOverlap="false" matBadgePosition="above after"
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
  styleUrls: ['./main-layout.component.scss']
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
    window.addEventListener('resize', this.checkScreenSize);
    this.loadUnreadCount();
    this.loadRecentNotifications();
    this.pollingSub = interval(30000).pipe(
      switchMap(() => this.notificationService.getUnreadCount())
    ).subscribe({
      next: (res) => {
        if (res.success) this.unreadCount.set(res.data.count);
      }
    });
  }

  ngOnDestroy(): void {
    this.pollingSub?.unsubscribe();
    window.removeEventListener('resize', this.checkScreenSize);
  }

  private checkScreenSize = (): void => {
    if (window.innerWidth < 768) {
      this.sidenavMode = 'over';
      this.sidenavOpened = false;
    } else {
      this.sidenavMode = 'side';
      this.sidenavOpened = true;
    }
  };

  private loadUnreadCount(): void {
    this.notificationService.getUnreadCount().subscribe({
      next: (res) => {
        if (res.success) this.unreadCount.set(res.data.count);
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
