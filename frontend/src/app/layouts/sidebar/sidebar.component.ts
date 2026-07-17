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
          <span class="logo-icon">🛡</span>
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
  styles: [`
    .sidebar {
      width: 260px;
      min-height: 100vh;
      background: #0f172a;
      color: #e2e8f0;
      display: flex;
      flex-direction: column;
      transition: width 0.3s ease;
      position: fixed;
      left: 0;
      top: 0;
      z-index: 100;
    }
    .sidebar.collapsed { width: 64px; }
    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      border-bottom: 1px solid #1e293b;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .logo-icon { font-size: 1.5rem; }
    .logo-text { font-weight: 700; font-size: 1.125rem; }
    .toggle-btn {
      background: none;
      border: 1px solid #334155;
      color: #94a3b8;
      border-radius: 6px;
      padding: 0.25rem 0.5rem;
      cursor: pointer;
      font-size: 0.875rem;
    }
    .toggle-btn:hover { background: #1e293b; color: #e2e8f0; }
    .sidebar-nav { flex: 1; padding: 0.75rem 0; overflow-y: auto; }
    .sidebar-nav ul { list-style: none; margin: 0; padding: 0; }
    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.625rem 1rem;
      color: #94a3b8;
      text-decoration: none;
      font-size: 0.875rem;
      transition: all 0.15s;
      border-left: 3px solid transparent;
    }
    .nav-link:hover { background: #1e293b; color: #e2e8f0; }
    .nav-link.active { background: #1e293b; color: #3b82f6; border-left-color: #3b82f6; }
    .nav-icon { font-size: 1.125rem; width: 24px; text-align: center; flex-shrink: 0; }
    .nav-label { white-space: nowrap; }
    .sidebar-footer { padding: 1rem; border-top: 1px solid #1e293b; }
    .version { font-size: 0.75rem; color: #475569; margin: 0; }
  `],
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
