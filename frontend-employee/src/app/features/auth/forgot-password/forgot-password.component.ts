import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
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
    CommonModule, ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="forgot-container">
      <mat-card class="forgot-card">
        <mat-card-header>
          <mat-card-title>
            <div class="forgot-header">
              <img src="assets/images/ecx-logo.png" alt="ECX Logo" class="forgot-logo">
              <h2>Forgot Password</h2>
              <p>Enter your email to receive a password reset link</p>
            </div>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          @if (successMessage()) {
            <div class="success-message">
              <mat-icon>check_circle</mat-icon>
              {{ successMessage() }}
            </div>
          }

          @if (!successMessage()) {
            <form [formGroup]="resetForm" (ngSubmit)="onSubmit()">
              <mat-form-field appearance="outline">
                <mat-label>Email</mat-label>
                <input matInput formControlName="email" type="email" placeholder="Enter your email">
                <mat-icon matSuffix>email</mat-icon>
                @if (resetForm.get('email')?.hasError('required') && resetForm.get('email')?.touched) {
                  <mat-error>Email is required</mat-error>
                }
                @if (resetForm.get('email')?.hasError('email') && resetForm.get('email')?.touched) {
                  <mat-error>Please enter a valid email</mat-error>
                }
              </mat-form-field>

              @if (errorMessage()) {
                <div class="error-message">
                  <mat-icon>error</mat-icon>
                  {{ errorMessage() }}
                </div>
              }

              <button mat-raised-button color="primary" type="submit" class="reset-btn"
                      [disabled]="isLoading()">
                @if (isLoading()) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  <mat-icon>send</mat-icon>
                  Send Reset Link
                }
              </button>
            </form>
          }
        </mat-card-content>
        <mat-card-actions>
          <a routerLink="/auth/login" class="back-link">
            <mat-icon>arrow_back</mat-icon>
            Back to Login
          </a>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  resetForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  onSubmit(): void {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.forgotPassword(this.resetForm.value.email).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success) {
          this.successMessage.set('If an account exists with this email, you will receive a password reset link shortly.');
        } else {
          this.errorMessage.set(response.message || 'Failed to send reset link');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'An error occurred. Please try again.');
      }
    });
  }
}
