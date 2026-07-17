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
        <div class="brand">
          <div class="logo-circle">
            <mat-icon>business</mat-icon>
          </div>
          <h1>ECX</h1>
          <p>Visitor Management System</p>
          <p class="subtitle">Employee Portal</p>
        </div>
      </div>
      <div class="auth-right">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .auth-layout {
      display: flex;
      min-height: 100vh;
    }
    .auth-left {
      flex: 1;
      background: linear-gradient(135deg, #1a237e 0%, #2e7d32 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      padding: 40px;
    }
    .brand {
      text-align: center;
    }
    .logo-circle {
      width: 100px;
      height: 100px;
      background: rgba(255,255,255,0.15);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
    }
    .logo-circle mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }
    .brand h1 {
      font-size: 48px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .brand p {
      font-size: 18px;
      opacity: 0.9;
    }
    .brand .subtitle {
      font-size: 14px;
      opacity: 0.7;
      margin-top: 4px;
    }
    .auth-right {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
      background: #f5f5f5;
    }
    @media (max-width: 768px) {
      .auth-layout { flex-direction: column; }
      .auth-left { min-height: 200px; padding: 24px; }
      .auth-left .brand h1 { font-size: 32px; }
      .auth-left .logo-circle { width: 64px; height: 64px; }
      .auth-left .logo-circle mat-icon { font-size: 32px; width: 32px; height: 32px; }
      .auth-right { padding: 24px; }
    }
  `]
})
export class AuthLayoutComponent {}
