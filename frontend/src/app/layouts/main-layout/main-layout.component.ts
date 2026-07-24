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
  styleUrls: ['./main-layout.component.scss'],
})
export class MainLayoutComponent {}
