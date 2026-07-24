import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSlideToggleModule,
    MatDividerModule, MatProgressSpinnerModule, MatSnackBarModule
  ],
  template: `
    <div class="settings-page">
      <div class="page-header">
        <h1>Settings</h1>
      </div>

      <div class="settings-grid">
        <mat-card>
          <mat-card-header>
            <mat-card-title>
              <mat-icon>person</mat-icon> Profile Information
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="profile-info">
              <div class="profile-avatar">{{ userInitials() }}</div>
              <div class="profile-details">
                <h3>{{ currentUser()?.fullName }}</h3>
                <p>{{ currentUser()?.email }}</p>
                <span class="role-badge">{{ currentUser()?.role }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-card-title>
              <mat-icon>lock</mat-icon> Change Password
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Current Password</mat-label>
                <input matInput formControlName="currentPassword" [type]="hideCurrent() ? 'password' : 'text'">
                <button mat-icon-button matSuffix type="button" (click)="hideCurrent.set(!hideCurrent())">
                  <mat-icon>{{ hideCurrent() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>New Password</mat-label>
                <input matInput formControlName="newPassword" [type]="hideNew() ? 'password' : 'text'">
                <button mat-icon-button matSuffix type="button" (click)="hideNew.set(!hideNew())">
                  <mat-icon>{{ hideNew() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Confirm New Password</mat-label>
                <input matInput formControlName="confirmPassword" [type]="hideConfirm() ? 'password' : 'text'">
                <button mat-icon-button matSuffix type="button" (click)="hideConfirm.set(!hideConfirm())">
                  <mat-icon>{{ hideConfirm() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                @if (passwordForm.get('confirmPassword')?.touched && passwordForm.hasError('mismatch')) {
                  <mat-error>Passwords do not match</mat-error>
                }
              </mat-form-field>
              <button mat-raised-button color="primary" type="submit" [disabled]="isChangingPassword() || passwordForm.invalid">
                @if (isChangingPassword()) { <mat-spinner diameter="20"></mat-spinner> }
                <mat-icon>save</mat-icon> Update Password
              </button>
            </form>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-card-title>
              <mat-icon>tune</mat-icon> Preferences
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="pref-item">
              <div>
                <strong>Email Notifications</strong>
                <p>Receive email alerts for appointments and approvals</p>
              </div>
              <mat-slide-toggle color="primary" [checked]="emailNotifications()" (change)="emailNotifications.set(!emailNotifications())"></mat-slide-toggle>
            </div>
            <mat-divider></mat-divider>
            <div class="pref-item">
              <div>
                <strong>Desktop Notifications</strong>
                <p>Show browser notifications for real-time alerts</p>
              </div>
              <mat-slide-toggle color="primary" [checked]="desktopNotifications()" (change)="desktopNotifications.set(!desktopNotifications())"></mat-slide-toggle>
            </div>
            <mat-divider></mat-divider>
            <div class="pref-item">
              <div>
                <strong>Compact Mode</strong>
                <p>Use a more compact layout for lists and tables</p>
              </div>
              <mat-slide-toggle color="primary" [checked]="compactMode()" (change)="compactMode.set(!compactMode())"></mat-slide-toggle>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-card-title>
              <mat-icon>info</mat-icon> About
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="about-info">
              <p><strong>ECX Visitor Management System</strong></p>
              <p>Employee Portal v1.0.0</p>
              <p>Angular {{ angularVersion }}</p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  currentUser = signal(this.authService.currentUser);
  angularVersion = '22';
  isChangingPassword = signal(false);
  hideCurrent = signal(true);
  hideNew = signal(true);
  hideConfirm = signal(true);
  emailNotifications = signal(true);
  desktopNotifications = signal(false);
  compactMode = signal(false);

  passwordForm: FormGroup = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  }, { validators: this.passwordMatchValidator });

  userInitials(): string {
    const user = this.currentUser();
    return user?.fullName ? user.fullName.split(' ').map(n => n.charAt(0)).join('').toUpperCase() : '';
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('newPassword')?.value === form.get('confirmPassword')?.value ? null : { mismatch: true };
  }

  changePassword(): void {
    if (this.passwordForm.invalid) { this.passwordForm.markAllAsTouched(); return; }
    this.isChangingPassword.set(true);
    const { currentPassword, newPassword } = this.passwordForm.value;
    this.authService.changePassword(currentPassword, newPassword).subscribe({
      next: (res) => {
        this.isChangingPassword.set(false);
        if (res.success) {
          this.snackBar.open('Password updated successfully', 'Close', { duration: 3000 });
          this.passwordForm.reset();
        }
      },
      error: (err) => {
        this.isChangingPassword.set(false);
        this.snackBar.open(err.error?.message || 'Failed to update password', 'Close', { duration: 3000 });
      }
    });
  }
}
