import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <mat-card class="auth-card">
      <mat-card-content>
        <div class="icon-container">
          <mat-icon>lock_reset</mat-icon>
        </div>
        <h2>Forgot Password?</h2>

        @if (!emailSent) {
          <p class="auth-subtitle">
            Enter your email and we'll send you a link to reset your password.
          </p>
        }

        @if (emailSent) {
          <div class="success-banner">
            <mat-icon>check_circle</mat-icon>
            If an account exists with that email, a reset link has been sent.
          </div>
        }

        @if (errorMessage) {
          <div class="error-banner">
            <mat-icon>error</mat-icon>
            {{ errorMessage }}
          </div>
        }

        @if (!emailSent) {
          <form (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline">
              <mat-label>Email Address</mat-label>
              <input matInput [(ngModel)]="email" name="email" type="email" required email>
              <mat-icon matPrefix>email</mat-icon>
            </mat-form-field>

            <button mat-flat-button color="primary" type="submit" class="auth-btn" [disabled]="loading">
              @if (loading) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                <span>Send Reset Link</span>
              }
            </button>
          </form>
        }

        <div class="auth-footer">
          <a routerLink="/auth/login">
            <mat-icon>arrow_back</mat-icon>
            Back to Sign In
          </a>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .auth-card {
      padding: 40px 36px;
      border-radius: 16px;
      text-align: center;
    }

    .icon-container {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #e8f5e9;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
    }

    .icon-container mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #2e7d32;
    }

    h2 {
      font-size: 22px;
      font-weight: 700;
      color: #1b5e20;
      margin-bottom: 8px;
    }

    .auth-subtitle {
      color: #64748b;
      font-size: 14px;
      margin-bottom: 24px;
    }

    .error-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: #ffebee;
      color: #c62828;
      border-radius: 8px;
      font-size: 14px;
      margin-bottom: 20px;
      text-align: left;
    }

    .success-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: #e8f5e9;
      color: #2e7d32;
      border-radius: 8px;
      font-size: 14px;
      margin-bottom: 20px;
      text-align: left;
    }

    .auth-btn {
      width: 100%;
      height: 48px;
      font-size: 16px;
      font-weight: 600;
      background: #2e7d32 !important;
    }

    .auth-footer {
      margin-top: 24px;
    }

    .auth-footer a {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: #2e7d32;
      font-size: 14px;
      font-weight: 500;
    }
  `],
})
export class ForgotPasswordComponent {
  private authService = inject(AuthService);

  email = '';
  loading = false;
  emailSent = false;
  errorMessage = '';

  onSubmit(): void {
    this.loading = true;
    this.errorMessage = '';
    this.authService.forgotPassword({ email: this.email }).subscribe({
      next: () => {
        this.loading = false;
        this.emailSent = true;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.message || 'Something went wrong. Please try again.';
      },
    });
  }
}
