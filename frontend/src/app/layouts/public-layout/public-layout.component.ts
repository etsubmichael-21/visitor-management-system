import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule,
  ],
  template: `
    <div class="public-layout">
      <mat-toolbar class="ecx-toolbar">
        <div class="toolbar-inner">
          <a routerLink="/" class="brand">
            <mat-icon class="brand-icon">apartment</mat-icon>
            <span class="brand-text">ECX <span class="brand-accent">Visitor Portal</span></span>
          </a>

          <nav class="nav-links" [class.hidden-mobile]="menuOpen">
            <a mat-button routerLink="/" routerLinkActive="active-link" [routerLinkActiveOptions]="{ exact: true }">Home</a>
            <a mat-button routerLink="/about" routerLinkActive="active-link">About</a>
            <a mat-button routerLink="/contact" routerLinkActive="active-link">Contact</a>
          </nav>

          <div class="toolbar-actions">
            <a mat-button routerLink="/auth/login" class="login-btn">Sign In</a>
            <a mat-flat-button color="primary" routerLink="/auth/register" class="register-btn">Register</a>
            <button mat-icon-button [matMenuTriggerFor]="mobileMenu" class="mobile-menu-btn" matTooltip="Menu" aria-label="Open navigation menu">
              <mat-icon>menu</mat-icon>
            </button>
          </div>
        </div>

        <mat-menu #mobileMenu="matMenu">
          <a mat-menu-item routerLink="/">Home</a>
          <a mat-menu-item routerLink="/about">About</a>
          <a mat-menu-item routerLink="/contact">Contact</a>
          <mat-divider></mat-divider>
          <a mat-menu-item routerLink="/auth/login">Sign In</a>
          <a mat-menu-item routerLink="/auth/register">Register</a>
        </mat-menu>
      </mat-toolbar>

      <main class="public-main">
        <router-outlet />
      </main>

      <footer class="ecx-footer">
        <div class="footer-inner">
          <div class="footer-brand">
            <mat-icon>apartment</mat-icon>
            <span>ECX Visitor Management</span>
          </div>
          <div class="footer-links">
            <a routerLink="/">Home</a>
            <a routerLink="/about">About</a>
            <a routerLink="/contact">Contact</a>
            <a routerLink="/auth/login">Sign In</a>
          </div>
          <div class="footer-copyright">
            &copy; {{ currentYear }} ECX Corporation. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .public-layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .ecx-toolbar {
      background: #1b5e20;
      color: white;
      position: sticky;
      top: 0;
      z-index: 1000;
      padding: 0 24px;
    }

    .toolbar-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 8px;
      color: white;
      text-decoration: none;
    }

    .brand-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: #d4a017;
    }

    .brand-text {
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }

    .brand-accent {
      color: #d4a017;
    }

    .nav-links {
      display: flex;
      gap: 4px;
    }

    .nav-links a {
      color: rgba(255, 255, 255, 0.85);
      font-weight: 500;
    }

    .nav-links a:hover, .nav-links .active-link {
      color: #d4a017;
      background: rgba(255, 255, 255, 0.1);
    }

    .toolbar-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .login-btn {
      color: rgba(255, 255, 255, 0.9) !important;
    }

    .register-btn {
      background: #d4a017 !important;
      color: #1b5e20 !important;
      font-weight: 600;
    }

    .mobile-menu-btn {
      color: white;
      display: none;
    }

    .public-main {
      flex: 1;
    }

    .ecx-footer {
      background: #1b5e20;
      color: rgba(255, 255, 255, 0.85);
      padding: 40px 24px 24px;
    }

    .footer-inner {
      max-width: 1200px;
      margin: 0 auto;
      text-align: center;
    }

    .footer-brand {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 16px;
    }

    .footer-brand mat-icon {
      color: #d4a017;
    }

    .footer-links {
      display: flex;
      justify-content: center;
      gap: 24px;
      margin-bottom: 20px;
    }

    .footer-links a {
      color: rgba(255, 255, 255, 0.7);
      font-size: 14px;
      transition: color 0.2s;
    }

    .footer-links a:hover {
      color: #d4a017;
    }

    .footer-copyright {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.5);
      border-top: 1px solid rgba(255, 255, 255, 0.15);
      padding-top: 16px;
    }

    @media (max-width: 768px) {
      .nav-links { display: none; }
      .login-btn, .register-btn { display: none; }
      .mobile-menu-btn { display: inline-block; }
      .hidden-mobile { display: none; }
      .footer-links { flex-wrap: wrap; gap: 16px; }
    }
  `],
})
export class PublicLayoutComponent {
  currentYear = new Date().getFullYear();
  menuOpen = false;
}
