import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="login-page">
      <mat-card class="login-card">
        <div class="login-header">
          <div class="logo-wrapper">
            <div class="logo-icon">
              <mat-icon>shield</mat-icon>
            </div>
          </div>
          <h1 class="app-title">ECX Visitor Management</h1>
          <p class="app-subtitle">Employee Portal</p>
        </div>

        <div class="login-body">
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email" placeholder="Enter your email" autocomplete="email">
              <mat-icon matPrefix>email</mat-icon>
              @if (loginForm.get('email')?.hasError('required') && loginForm.get('email')?.touched) {
                <mat-error>Email is required</mat-error>
              }
              @if (loginForm.get('email')?.hasError('email') && loginForm.get('email')?.touched) {
                <mat-error>Please enter a valid email</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput formControlName="password" [type]="hidePassword() ? 'password' : 'text'"
                     placeholder="Enter your password" autocomplete="current-password">
              <mat-icon matPrefix>lock</mat-icon>
              <button mat-icon-button matSuffix type="button" (click)="hidePassword.set(!hidePassword())">
                <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (loginForm.get('password')?.hasError('required') && loginForm.get('password')?.touched) {
                <mat-error>Password is required</mat-error>
              }
            </mat-form-field>

            @if (errorMessage()) {
              <div class="error-message">
                <mat-icon class="error-icon">error_outline</mat-icon>
                <span>{{ errorMessage() }}</span>
              </div>
            }

            <button mat-raised-button color="primary" type="submit" class="login-btn"
                    [disabled]="isLoading()">
              @if (isLoading()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                Sign In
              }
            </button>
          </form>
        </div>

        <div class="login-footer">
          <a routerLink="/auth/forgot-password" class="forgot-link">Forgot Password?</a>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-page {
      width: 100%;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      box-sizing: border-box;
      background: linear-gradient(135deg, #e8f5e9 0%, #f5f5f5 50%, #e8f5e9 100%);
    }

    .login-card {
      max-width: 400px;
      width: 100%;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      padding: 0;
    }

    .login-header {
      text-align: center;
      padding: 40px 32px 0;
    }

    .logo-wrapper {
      display: flex;
      justify-content: center;
      margin-bottom: 16px;
    }

    .logo-icon {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      background: linear-gradient(135deg, #2e7d32, #1b5e20);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 16px rgba(46, 125, 50, 0.3);
    }

    .logo-icon mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: white;
    }

    .app-title {
      font-size: 20px;
      font-weight: 600;
      color: #1a237e;
      margin: 0 0 4px 0;
    }

    .app-subtitle {
      font-size: 13px;
      color: #666;
      margin: 0;
    }

    .login-body {
      padding: 32px 32px 0;
    }

    .full-width {
      width: 100%;
      margin-bottom: 4px;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #c62828;
      background: #ffebee;
      padding: 12px 14px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-size: 13px;
      border: 1px solid #ffcdd2;
    }

    .error-icon {
      flex-shrink: 0;
    }

    .login-btn {
      width: 100%;
      height: 46px;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 500;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
    }

    .login-footer {
      text-align: center;
      padding: 16px 32px 32px;
    }

    .forgot-link {
      color: #1565c0;
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
    }

    .forgot-link:hover {
      text-decoration: underline;
    }

    @media (max-width: 480px) {
      .login-page {
        padding: 16px;
        align-items: flex-start;
        padding-top: 48px;
      }

      .login-header {
        padding: 32px 24px 0;
      }

      .login-body {
        padding: 24px 24px 0;
      }

      .login-footer {
        padding: 12px 24px 24px;
      }

      .app-title {
        font-size: 18px;
      }
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  hidePassword = signal(true);
  isLoading = signal(false);
  errorMessage = signal('');

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success) {
          const role = response.data.role;
          console.log(response);
          console.log("Role:", response.data.role);
          const dashboardMap: Record<string, string> = {
            'Admin': '/admin/dashboard',
            'CEO': '/ceo/dashboard',
            'DepartmentHead': '/dept/dashboard',
            'Employee': '/emp/dashboard',
            'Receptionist': '/reception/dashboard',
            'Security': '/security/dashboard'
          };
            console.log("Navigate to:", dashboardMap[role]);
          this.router.navigate([dashboardMap[role] || '/auth/login']).then(result => {
  console.log("Navigation:", result);
});;
        } else {
          this.errorMessage.set(response.message || 'Login failed');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Invalid email or password');
      }
    });
  }
}
