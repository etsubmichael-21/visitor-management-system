import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
  children?: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgFor, NgIf, MatIconModule],
  template: `
    <aside class="sidebar" [class.collapsed]="collapsed">
      <div class="sidebar-header">
        <div class="logo">
          <img src="assets/images/ecx-logo.png" alt="ECX Logo" class="sidebar-logo">
          <span *ngIf="!collapsed" class="logo-text">ECX Visitor</span>
        </div>
        <button class="toggle-btn" (click)="toggle()" [attr.aria-label]="collapsed ? 'Expand sidebar' : 'Collapse sidebar'">
          {{ collapsed ? '\u2192' : '\u2190' }}
        </button>
      </div>
      <nav class="sidebar-nav" aria-label="Main navigation">
        <ul>
          <li *ngFor="let item of filteredNavItems">
            <a
              [routerLink]="item.route"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
              class="nav-link"
            >
              <mat-icon class="nav-icon">{{ item.icon }}</mat-icon>
              <span *ngIf="!collapsed" class="nav-label">{{ item.label }}</span>
            </a>
          </li>
        </ul>
      </nav>
      <div class="sidebar-footer" *ngIf="!collapsed">
        <p class="version">ECX Visitor Management v1.0</p>
      </div>
    </aside>
  `,
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  private authService = inject(AuthService);
  collapsed = false;

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Visitors', icon: 'people', route: '/visitors' },
    { label: 'Employees', icon: 'badge', route: '/employees' },
    { label: 'Departments', icon: 'business', route: '/departments' },
    { label: 'Visits', icon: 'fact_check', route: '/visits' },
    { label: 'Appointments', icon: 'event', route: '/appointments' },
    { label: 'Users', icon: 'manage_accounts', route: '/users', roles: ['Admin'] },
    { label: 'Notifications', icon: 'notifications', route: '/notifications' },
    { label: 'Reports', icon: 'assessment', route: '/reports', roles: ['Admin', 'Receptionist'] },
    { label: 'Profile', icon: 'person', route: '/profile' },
    { label: 'Settings', icon: 'settings', route: '/settings', roles: ['Admin'] },
  ];

  get filteredNavItems(): NavItem[] {
    const user = this.authService.currentUser;
    if (!user) return [];
    return this.navItems.filter((item) => {
      if (!item.roles || item.roles.length === 0) return true;
      return item.roles.includes(user.role);
    });
  }

  toggle(): void { this.collapsed = !this.collapsed; }
}
