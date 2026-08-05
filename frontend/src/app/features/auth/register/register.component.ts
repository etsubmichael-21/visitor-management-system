import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequest } from '../../../core/models/auth.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="register-wrapper">
      <div class="register-card">
        <div class="card-header">
          <img src="assets/images/ecx-logo.png" alt="ECX Logo" class="ecx-logo">
          <h2>Create Account</h2>
          <p>Register as a visitor to ECX facilities</p>
        </div>

        @if (errorMessage) {
          <div class="error-banner">
            <mat-icon>error_outline</mat-icon>
            <span>{{ errorMessage }}</span>
          </div>
        }

        <form (ngSubmit)="onRegister()" class="register-form">
          <mat-form-field appearance="outline">
            <mat-label>Full Name</mat-label>
            <input matInput [(ngModel)]="form.fullName" name="fullName" placeholder="Enter your full name" required>
            <mat-icon matPrefix>person</mat-icon>
          </mat-form-field>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput [(ngModel)]="form.email" name="email" type="email" placeholder="you@example.com" required email>
              <mat-icon matPrefix>email</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Phone</mat-label>
              <input matInput [(ngModel)]="form.phone" name="phone" placeholder="+251 9XX XXX XXX" required>
              <mat-icon matPrefix>phone</mat-icon>
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline">
            <mat-label>Organization</mat-label>
            <input matInput [(ngModel)]="form.organization" name="organization" placeholder="Company or organization (optional)">
            <mat-icon matPrefix>business</mat-icon>
          </mat-form-field>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Password</mat-label>
              <input matInput [(ngModel)]="form.password" name="password" [type]="showPassword ? 'text' : 'password'" placeholder="Min 8 characters" required minlength="8">
              <mat-icon matPrefix>lock</mat-icon>
              <button mat-icon-button matSuffix type="button" (click)="showPassword = !showPassword" [matTooltip]="showPassword ? 'Hide' : 'Show'">
                <mat-icon>{{ showPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Confirm</mat-label>
              <input matInput [(ngModel)]="form.confirmPassword" name="confirmPassword" [type]="showPassword ? 'text' : 'password'" placeholder="Re-enter password" required>
              <mat-icon matPrefix>lock_outline</mat-icon>
            </mat-form-field>
          </div>

          <button mat-flat-button type="submit" class="submit-btn" [disabled]="loading">
            @if (loading) {
              <mat-spinner diameter="20"></mat-spinner>
            } @else {
              Create Account
            }
          </button>
        </form>

        <div class="card-footer">
          <p>Already have an account? <a routerLink="/auth/login">Sign in</a></p>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./register.component.scss'],
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
    this.authService.register(request).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: () => {
        this.router.navigate(['/appointments/new']);
      },
      error: (err) => {
        this.errorMessage = err.message || 'Registration failed. Please try again.';
      },
    });
  }
}
