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
          <img src="assets/images/ecx-logo.png" alt="ECX Logo" style="width: 32px; height: 32px; object-fit: contain;">
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
  styleUrls: ['./forgot-password.component.scss'],
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
