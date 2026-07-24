import { Component, inject, OnInit, OnDestroy } from '@angular/core';
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
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { User } from '../../core/models/auth.model';

@Component({
  selector: 'app-visitor-layout',
  standalone: true,
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
  ],
  template: `
    <div class="visitor-layout">
      <mat-toolbar class="visitor-toolbar">
        <button mat-icon-button (click)="sidenav.toggle()" matTooltip="Toggle menu" aria-label="Toggle navigation menu">
          <mat-icon>menu</mat-icon>
        </button>

        <a routerLink="/dashboard" class="toolbar-brand">
          <img src="assets/images/ecx-logo.png" alt="ECX Logo" class="brand-logo">
          <span class="brand-text">ECX <span class="accent">Visitor Portal</span></span>
        </a>

        <span class="toolbar-spacer"></span>

        <button mat-icon-button routerLink="/notifications" [matBadge]="unreadCount" [matBadgeHidden]="unreadCount === 0" matBadgeColor="warn" matBadgeSize="small" matTooltip="Notifications" aria-label="View notifications">
          <mat-icon>notifications</mat-icon>
        </button>

        <button mat-icon-button [matMenuTriggerFor]="userMenu" matTooltip="Account" aria-label="Open account menu">
          <mat-icon>account_circle</mat-icon>
        </button>

        <mat-menu #userMenu="matMenu">
          <div class="user-menu-header" mat-menu-item disabled>
            <mat-icon>person</mat-icon>
            <span>{{ user?.firstName }} {{ user?.lastName }}</span>
          </div>
          <mat-divider></mat-divider>
          <a mat-menu-item routerLink="/profile">
            <mat-icon>person_outline</mat-icon>
            <span>My Profile</span>
          </a>
          <a mat-menu-item routerLink="/dashboard">
            <mat-icon>dashboard</mat-icon>
            <span>Dashboard</span>
          </a>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="logout()">
            <mat-icon>logout</mat-icon>
            <span>Sign Out</span>
          </button>
        </mat-menu>
      </mat-toolbar>

      <mat-sidenav-container class="visitor-sidenav-container">
        <mat-sidenav #sidenav [mode]="sidenavMode" [opened]="sidenavOpened" class="visitor-sidenav">
          <div class="sidenav-header">
            <img src="assets/images/ecx-logo.png" alt="ECX Logo" class="sidebar-logo">
            <div class="user-info">
              <div class="user-name">{{ user?.firstName }} {{ user?.lastName }}</div>
              <div class="user-email">{{ user?.email }}</div>
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
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  user: User | null = null;
  unreadCount = 0;
  sidenavMode: 'side' | 'over' = 'side';
  sidenavOpened = true;

  ngOnInit(): void {
    this.user = this.authService.currentUser;
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      this.user = user;
    });

    this.notificationService.pollUnreadCount().pipe(takeUntil(this.destroy$)).subscribe((count) => {
      this.unreadCount = count.count;
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
  };

  closeSidenavMobile(): void {
    if (this.sidenavMode === 'over') {
      this.router.navigate([]);
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
