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
import { RegisterRequest } from '../../../core/models/auth.model';

@Component({
  selector: 'app-register',
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
        <h2>Create Account</h2>
        <p class="auth-subtitle">Register as a visitor to ECX facilities</p>

        @if (errorMessage) {
          <div class="error-banner">
            <mat-icon>error</mat-icon>
            {{ errorMessage }}
          </div>
        }

        <form (ngSubmit)="onRegister()">
          <mat-form-field appearance="outline">
            <mat-label>Full Name</mat-label>
            <input matInput [(ngModel)]="form.fullName" name="fullName" required>
            <mat-icon matPrefix>person</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Email Address</mat-label>
            <input matInput [(ngModel)]="form.email" name="email" type="email" required email>
            <mat-icon matPrefix>email</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Phone Number</mat-label>
            <input matInput [(ngModel)]="form.phone" name="phone" required>
            <mat-icon matPrefix>phone</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Organization (Optional)</mat-label>
            <input matInput [(ngModel)]="form.organization" name="organization">
            <mat-icon matPrefix>business</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Password</mat-label>
            <input matInput [(ngModel)]="form.password" name="password" [type]="showPassword ? 'text' : 'password'" required minlength="8">
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
              <span>Create Account</span>
            }
          </button>
        </form>

        <div class="auth-footer">
          Already have an account?
          <a routerLink="/auth/login">Sign in</a>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .auth-card {
      padding: 36px;
      border-radius: 16px;
    }

    h2 {
      font-size: 24px;
      font-weight: 700;
      color: #1b5e20;
      margin-bottom: 4px;
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
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .auth-btn {
      width: 100%;
      height: 48px;
      font-size: 16px;
      font-weight: 600;
      background: #2e7d32 !important;
      margin-top: 8px;
    }

    .auth-footer {
      text-align: center;
      margin-top: 20px;
      font-size: 14px;
      color: #64748b;
    }

    .auth-footer a {
      color: #2e7d32;
      font-weight: 600;
      margin-left: 4px;
    }
  `],
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  form: RegisterRequest & { confirmPassword: string } = {
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    organization: '',
  };

  showPassword = false;
  loading = false;
  errorMessage = '';

  onRegister(): void {
    if (this.form.password !== this.form.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    const { confirmPassword, ...request } = this.form;
    this.authService.register(request).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.message || 'Registration failed. Please try again.';
      },
    });
  }
}
