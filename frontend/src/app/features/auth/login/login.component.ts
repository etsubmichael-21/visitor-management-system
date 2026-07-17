import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <div class="login-header">
          <div class="logo-icon">
            <mat-icon>apartment</mat-icon>
          </div>
          <h1 class="app-title">ECX Visitor Management</h1>
          <p class="app-subtitle">Visitor Portal</p>
        </div>

        @if (errorMessage) {
          <div class="error-banner">
            <mat-icon>error_outline</mat-icon>
            <span>{{ errorMessage }}</span>
          </div>
        }

        <form (ngSubmit)="onLogin()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email</mat-label>
            <input matInput [(ngModel)]="credentials.email" name="email" type="email" required email>
            <mat-icon matPrefix>email</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Password</mat-label>
            <input matInput [(ngModel)]="credentials.password" name="password" [type]="showPassword ? 'text' : 'password'" required>
            <mat-icon matPrefix>lock</mat-icon>
            <button mat-icon-button matSuffix type="button" (click)="showPassword = !showPassword" [matTooltip]="showPassword ? 'Hide password' : 'Show password'" [attr.aria-label]="showPassword ? 'Hide password' : 'Show password'">
              <mat-icon>{{ showPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
          </mat-form-field>

          <div class="forgot-password">
            <a routerLink="/auth/forgot-password">Forgot Password?</a>
          </div>

          <button mat-flat-button color="primary" type="submit" class="sign-in-btn" [disabled]="loading">
            @if (loading) {
              <mat-spinner diameter="20"></mat-spinner>
            } @else {
              <span>Sign In</span>
            }
          </button>
        </form>
      </mat-card>

      <div class="login-footer">
        <p>&copy; 2024 ECX. All rights reserved.</p>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
      background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
    }

    .login-card {
      width: 100%;
      max-width: 400px;
      padding: 40px 32px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      border: none;
    }

    .login-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .logo-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 64px;
      height: 64px;
      border-radius: 12px;
      background: linear-gradient(135deg, #1a5f2a 0%, #2e7d32 100%);
      margin-bottom: 20px;
    }

    .logo-icon mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: white;
    }

    .app-title {
      font-size: 22px;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0 0 6px 0;
      letter-spacing: -0.3px;
    }

    .app-subtitle {
      font-size: 14px;
      color: #6b7280;
      margin: 0;
      font-weight: 400;
    }

    .error-banner {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fecaca;
      border-radius: 8px;
      font-size: 13px;
      margin-bottom: 20px;
    }

    .error-banner mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      flex-shrink: 0;
    }

    .full-width {
      width: 100%;
    }

    .forgot-password {
      display: flex;
      justify-content: flex-end;
      margin-top: -8px;
      margin-bottom: 24px;
    }

    .forgot-password a {
      font-size: 13px;
      color: #2e7d32;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s ease;
    }

    .forgot-password a:hover {
      color: #1a5f2a;
      text-decoration: underline;
    }

    .sign-in-btn {
      width: 100%;
      height: 48px;
      font-size: 15px;
      font-weight: 600;
      background: #2e7d32;
      border-radius: 8px;
      letter-spacing: 0.3px;
      transition: background-color 0.2s ease, box-shadow 0.2s ease;
    }

    .sign-in-btn:hover:not(:disabled) {
      background: #1a5f2a;
      box-shadow: 0 2px 8px rgba(46, 125, 50, 0.3);
    }

    .sign-in-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .login-footer {
      margin-top: 24px;
      text-align: center;
    }

    .login-footer p {
      font-size: 12px;
      color: #9ca3af;
      margin: 0;
    }

    @media (max-width: 480px) {
      .login-card {
        padding: 32px 24px;
      }

      .app-title {
        font-size: 20px;
      }

      .logo-icon {
        width: 56px;
        height: 56px;
      }

      .logo-icon mat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
      }
    }
  `],
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  credentials = { email: '', password: '' };
  showPassword = false;
  loading = false;
  errorMessage = '';

  onLogin(): void {
    this.loading = true;
    this.errorMessage = '';
    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.message || 'Invalid email or password. Please try again.';
      },
    });
  }
}
