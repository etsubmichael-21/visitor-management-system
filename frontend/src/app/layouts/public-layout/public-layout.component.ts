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
  styleUrls: ['./public-layout.component.scss'],
})
export class PublicLayoutComponent {
  currentYear = new Date().getFullYear();
  menuOpen = false;
}
