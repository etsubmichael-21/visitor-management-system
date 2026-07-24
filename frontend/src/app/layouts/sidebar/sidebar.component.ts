import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
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
  imports: [RouterLink, RouterLinkActive, NgFor, NgIf],
  template: `
    <aside class="sidebar" [class.collapsed]="collapsed">
      <div class="sidebar-header">
        <div class="logo">
          <img src="assets/images/ecx-logo.png" alt="ECX Logo" class="sidebar-logo">
          <span *ngIf="!collapsed" class="logo-text">ECX Visitor</span>
        </div>
        <button class="toggle-btn" (click)="toggle()">
          {{ collapsed ? '→' : '←' }}
        </button>
      </div>
      <nav class="sidebar-nav">
        <ul>
          <li *ngFor="let item of filteredNavItems">
            <a
              [routerLink]="item.route"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
              class="nav-link"
            >
              <span class="nav-icon">{{ item.icon }}</span>
              <span *ngIf="!collapsed" class="nav-label">{{ item.label }}</span>
            </a>
          </li>
        </ul>
      </nav>
      <div class="sidebar-footer" *ngIf="!collapsed">
        <p class="version">v1.0.0</p>
      </div>
    </aside>
  `,
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  private authService = inject(AuthService);
  collapsed = false;

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: '📊', route: '/dashboard' },
    { label: 'Visitors', icon: '👥', route: '/visitors' },
    { label: 'Employees', icon: '👔', route: '/employees' },
    { label: 'Departments', icon: '🏢', route: '/departments' },
    { label: 'Visits', icon: '📋', route: '/visits' },
    { label: 'Appointments', icon: '📅', route: '/appointments' },
    { label: 'Users', icon: '🔐', route: '/users', roles: ['Admin'] },
    { label: 'Notifications', icon: '🔔', route: '/notifications' },
    { label: 'Reports', icon: '📈', route: '/reports', roles: ['Admin', 'Receptionist'] },
    { label: 'Profile', icon: '👤', route: '/profile' },
    { label: 'Settings', icon: '⚙', route: '/settings', roles: ['Admin'] },
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
