import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NotificationToastComponent } from '../../shared/components/notification-toast/notification-toast.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, NotificationToastComponent],
  template: `
    <div class="layout">
      <app-sidebar />
      <main class="main-content">
        <div class="content-wrapper">
          <router-outlet />
        </div>
      </main>
      <app-notification-toast />
    </div>
  `,
  styles: [`
    .layout {
      display: flex;
      min-height: 100vh;
      background: #f1f5f9;
    }
    .main-content {
      flex: 1;
      margin-left: 260px;
      min-height: 100vh;
      transition: margin-left 0.3s ease;
    }
    .content-wrapper {
      padding: 1.5rem 2rem;
      max-width: 1400px;
    }
    @media (max-width: 768px) {
      .main-content { margin-left: 0; }
      .content-wrapper { padding: 1rem; }
    }
  `],
})
export class MainLayoutComponent {}
