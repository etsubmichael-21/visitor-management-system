import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, MatCardModule, MatIconModule],
  template: `
    <div class="auth-layout">
      <div class="auth-bg">
        <div class="auth-container">
          <div class="auth-header">
            <div class="auth-logo">
              <mat-icon class="logo-icon">apartment</mat-icon>
              <div class="logo-text">
                <span class="logo-ecx">ECX</span>
                <span class="logo-subtitle">Visitor Portal</span>
              </div>
            </div>
          </div>
          <router-outlet />
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-layout {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .auth-bg {
      width: 100%;
      min-height: 100vh;
      background: linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #388e3c 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      position: relative;
      overflow: hidden;
    }

    .auth-bg::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -30%;
      width: 80%;
      height: 200%;
      background: radial-gradient(ellipse, rgba(212, 160, 23, 0.08) 0%, transparent 70%);
    }

    .auth-container {
      width: 100%;
      max-width: 460px;
      position: relative;
      z-index: 1;
    }

    .auth-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .auth-logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }

    .logo-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: #d4a017;
    }

    .logo-text {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .logo-ecx {
      font-size: 28px;
      font-weight: 800;
      color: white;
      letter-spacing: 2px;
      line-height: 1;
    }

    .logo-subtitle {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.75);
      letter-spacing: 1px;
    }
  `],
})
export class AuthLayoutComponent {}
