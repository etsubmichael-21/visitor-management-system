import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
  selector: 'app-reset-password',
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
    <mat-card class="auth-card">
      <mat-card-content>
        <div class="icon-container">
          <img src="assets/images/ecx-logo.png" alt="ECX Logo" style="width: 32px; height: 32px; object-fit: contain;">
        </div>
        <h2>Reset Password</h2>
        <p class="auth-subtitle">Enter your new password below</p>

        @if (successMessage) {
          <div class="success-banner">
            <mat-icon>check_circle</mat-icon>
            {{ successMessage }}
          </div>
        }

        @if (errorMessage) {
          <div class="error-banner">
            <mat-icon>error</mat-icon>
            {{ errorMessage }}
          </div>
        }

        @if (!successMessage) {
          <form (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline">
              <mat-label>New Password</mat-label>
              <input matInput [(ngModel)]="form.newPassword" name="newPassword" [type]="showPassword ? 'text' : 'password'" required minlength="8">
              <mat-icon matPrefix>lock</mat-icon>
              <button mat-icon-button matSuffix type="button" (click)="showPassword = !showPassword" [matTooltip]="showPassword ? 'Hide password' : 'Show password'" [attr.aria-label]="showPassword ? 'Hide password' : 'Show password'">
                <mat-icon>{{ showPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Confirm Password</mat-label>
              <input matInput [(ngModel)]="form.confirmPassword" name="confirmPassword" [type]="showPassword ? 'text' : 'password'" required>
              <mat-icon matPrefix>lock_outline</mat-icon>
            </mat-form-field>

            <button mat-flat-button color="primary" type="submit" class="auth-btn" [disabled]="loading">
              @if (loading) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                <span>Reset Password</span>
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
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent implements OnInit {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  form = { newPassword: '', confirmPassword: '' };
  showPassword = false;
  loading = false;
  errorMessage = '';
  successMessage = '';
  token = '';

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'] || '';
  }

  onSubmit(): void {
    if (this.form.newPassword !== this.form.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    this.authService.resetPassword({ token: this.token, newPassword: this.form.newPassword }).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Password reset successful! Redirecting to login...';
        setTimeout(() => this.router.navigate(['/auth/login']), 2000);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.message || 'Failed to reset password. The link may have expired.';
      },
    });
  }
}
