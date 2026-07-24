import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, MatIconModule],
  template: `
    <div class="auth-layout">
      <div class="auth-left">
        <div class="left-content">
          <div class="brand">
            <div class="logo-mark">
              <mat-icon>apartment</mat-icon>
            </div>
            <span class="brand-name">ECX</span>
          </div>
          <h1>Welcome to ECX<br>Visitor Management</h1>
          <p class="tagline">Schedule visits, check in seamlessly, and stay connected — all from one portal.</p>
          <div class="feature-list">
            <div class="feature-item">
              <mat-icon>event_available</mat-icon>
              <span>Easy appointment scheduling</span>
            </div>
            <div class="feature-item">
              <mat-icon>speed</mat-icon>
              <span>Fast &amp; secure check-in</span>
            </div>
            <div class="feature-item">
              <mat-icon>notifications_active</mat-icon>
              <span>Real-time notifications</span>
            </div>
            <div class="feature-item">
              <mat-icon>history</mat-icon>
              <span>Visit history &amp; tracking</span>
            </div>
          </div>
        </div>
        <div class="left-footer">&copy; 2026 ECX. All rights reserved.</div>
      </div>
      <div class="auth-right">
        <router-outlet />
      </div>
    </div>
  `,
  styleUrls: ['./auth-layout.component.scss'],
})
export class AuthLayoutComponent {}
