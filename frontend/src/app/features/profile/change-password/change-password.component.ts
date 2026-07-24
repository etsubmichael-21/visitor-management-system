import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="change-password-page fade-in">
      <a routerLink="/profile" class="back-link">
        <mat-icon>arrow_back</mat-icon>
        Back to Profile
      </a>

      <h1 class="page-title">Change Password</h1>

      <mat-card class="form-card">
        <mat-card-content>
          @if (errorMessage) {
            <div class="error-banner">
              <mat-icon>error</mat-icon>
              {{ errorMessage }}
            </div>
          }

          @if (successMessage) {
            <div class="success-banner">
              <mat-icon>check_circle</mat-icon>
              {{ successMessage }}
            </div>
          }

          <form (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline">
              <mat-label>Current Password</mat-label>
              <input
                matInput
                [(ngModel)]="currentPassword"
                name="currentPassword"
                [type]="showCurrentPassword ? 'text' : 'password'"
                required
              >
              <mat-icon matPrefix>lock</mat-icon>
              <button
                mat-icon-button
                matSuffix
                type="button"
                (click)="showCurrentPassword = !showCurrentPassword"
                [matTooltip]="showCurrentPassword ? 'Hide current password' : 'Show current password'"
                [attr.aria-label]="showCurrentPassword ? 'Hide current password' : 'Show current password'"
              >
                <mat-icon>{{ showCurrentPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>New Password</mat-label>
              <input
                matInput
                [(ngModel)]="newPassword"
                name="newPassword"
                [type]="showNewPassword ? 'text' : 'password'"
                required
                minlength="6"
              >
              <mat-icon matPrefix>lock_outline</mat-icon>
              <mat-hint>Minimum 6 characters</mat-hint>
              <button
                mat-icon-button
                matSuffix
                type="button"
                (click)="showNewPassword = !showNewPassword"
                [matTooltip]="showNewPassword ? 'Hide new password' : 'Show new password'"
                [attr.aria-label]="showNewPassword ? 'Hide new password' : 'Show new password'"
              >
                <mat-icon>{{ showNewPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Confirm New Password</mat-label>
              <input
                matInput
                [(ngModel)]="confirmPassword"
                name="confirmPassword"
                [type]="showConfirmPassword ? 'text' : 'password'"
                required
              >
              <mat-icon matPrefix>lock_outline</mat-icon>
              <button
                mat-icon-button
                matSuffix
                type="button"
                (click)="showConfirmPassword = !showConfirmPassword"
                [matTooltip]="showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'"
                [attr.aria-label]="showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'"
              >
                <mat-icon>{{ showConfirmPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </mat-form-field>

            <div class="form-actions">
              <button
                mat-stroked-button
                type="button"
                routerLink="/profile"
                class="cancel-btn"
              >
                Cancel
              </button>
              <button
                mat-flat-button
                color="primary"
                type="submit"
                [disabled]="loading || !isFormValid()"
                class="submit-btn"
              >
                @if (loading) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  <span>Update Password</span>
                }
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  loading = false;
  errorMessage = '';
  successMessage = '';

  isFormValid(): boolean {
    return (
      this.currentPassword.length > 0 &&
      this.newPassword.length >= 6 &&
      this.confirmPassword.length > 0 &&
      this.newPassword === this.confirmPassword
    );
  }

  onSubmit(): void {
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    if (this.newPassword.length < 6) {
      this.errorMessage = 'New password must be at least 6 characters.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService
      .changePassword({
        oldPassword: this.currentPassword,
        newPassword: this.newPassword,
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.successMessage = 'Password changed successfully! Redirecting to profile...';
          setTimeout(() => this.router.navigate(['/profile']), 2000);
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.message || 'Failed to change password. Please check your current password.';
        },
      });
  }
}
