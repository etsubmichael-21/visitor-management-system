import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule, MatSnackBarRef } from '@angular/material/snack-bar';
import { VisitorService } from '../../core/services/visitor.service';
import { VisitorProfile, UpdateProfileRequest } from '../../core/models/visitor.model';

@Component({
  selector: 'app-profile-updated-toast',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  styles: [
    `
    :host { display: block; }
    .toast {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 6px 0;
      min-width: 320px;
      max-width: 480px;
    }
    .toast-icon {
      color: #ffffff;
      font-size: 30px;
      width: 30px;
      height: 30px;
      flex-shrink: 0;
    }
    .toast-body { flex: 1; min-width: 0; }
    .toast-title {
      font-size: 15px;
      font-weight: 700;
      color: #ffffff;
      line-height: 1.3;
    }
    .toast-message {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.92);
      line-height: 1.45;
      margin-top: 3px;
    }
    .toast-close {
      flex-shrink: 0;
      color: rgba(255, 255, 255, 0.85);
    }
    .toast-close mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    ::ng-deep .vm-profile-success .mdc-snackbar__surface {
      background: #0F6B3A;
      border-radius: 10px;
      box-shadow: 0 6px 22px rgba(0, 0, 0, 0.28);
    }
    `,
  ],
  template: `
    <div class="toast">
      <mat-icon class="toast-icon" aria-hidden="true">check_circle</mat-icon>
      <div class="toast-body">
        <div class="toast-title">Profile Updated</div>
        <div class="toast-message">Your profile has been updated successfully.</div>
      </div>
      <button mat-icon-button class="toast-close" aria-label="Close notification" (click)="dismiss()">
        <mat-icon>close</mat-icon>
      </button>
    </div>
  `,
})
export class ProfileUpdatedToastComponent {
  private snackBarRef = inject(MatSnackBarRef<ProfileUpdatedToastComponent>);

  dismiss(): void {
    this.snackBarRef.dismiss();
  }
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="profile-page fade-in">
      <h1 class="page-title">My Profile</h1>

      <div class="profile-grid">
        <mat-card class="photo-card">
          <mat-card-content>
            <div class="photo-section">
              <div class="avatar">
                @if (!profile?.photoUrl) {
                  <mat-icon>person</mat-icon>
                }
                @if (profile?.photoUrl) {
                  <img [src]="visitorService.resolvePhotoUrl(profile.photoUrl)" alt="Profile">
                }
              </div>
              <h3>{{ profile?.fullName }}</h3>
              <p class="user-email">{{ profile?.email }}</p>
              <mat-divider></mat-divider>

              <div class="upload-section">
                <input type="file" #fileInput (change)="onPhotoUpload($event)" accept="image/*" hidden>
                <button mat-stroked-button color="primary" (click)="fileInput.click()" [disabled]="uploading">
                  @if (uploading) {
                    <mat-spinner diameter="16"></mat-spinner>
                  } @else {
                    <mat-icon>camera_alt</mat-icon>
                  }
                  Upload Photo
                </button>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="details-card">
          <mat-card-content>
            <h2>Personal Information</h2>

            @if (loading) {
              <div class="loading-row">
                <mat-spinner diameter="28"></mat-spinner>
              </div>
            } @else {
              @if (errorMessage) {
                <div class="error-banner">
                  <mat-icon>error</mat-icon>
                  {{ errorMessage }}
                </div>
              }

              <form (ngSubmit)="onSave()">
                <mat-form-field appearance="outline">
                  <mat-label>Full Name</mat-label>
                  <input matInput [(ngModel)]="editForm.fullName" name="fullName" required #fullNameModel="ngModel">
                  @if (fullNameModel.invalid && fullNameModel.touched) {
                    <mat-error>Full name is required.</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Email</mat-label>
                  <input matInput [value]="profile?.email" name="email" readonly>
                  <mat-icon matPrefix>mail</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Phone</mat-label>
                  <input matInput [(ngModel)]="editForm.phone" name="phone" required #phoneModel="ngModel">
                  <mat-icon matPrefix>phone</mat-icon>
                  @if (phoneModel.invalid && phoneModel.touched) {
                    <mat-error>Phone number is required.</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Organization</mat-label>
                  <input matInput [(ngModel)]="editForm.organization" name="organization">
                  <mat-icon matPrefix>business</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Gender</mat-label>
                  <input matInput [(ngModel)]="editForm.gender" name="gender">
                </mat-form-field>

                <h3 class="section-label">Address</h3>

                <mat-form-field appearance="outline">
                  <mat-label>Address</mat-label>
                  <input matInput [(ngModel)]="editForm.address" name="address">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>National ID</mat-label>
                  <input matInput [(ngModel)]="editForm.nationalId" name="nationalId">
                </mat-form-field>

                <div class="form-actions">
                  <button mat-flat-button color="primary" type="submit" [disabled]="saving">
                    @if (saving) {
                      <mat-spinner diameter="16"></mat-spinner>
                    } @else {
                      <span>Save Changes</span>
                    }
                  </button>
                </div>
              </form>
            }
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  visitorService = inject(VisitorService);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  profile: VisitorProfile | null = null;
  editForm: UpdateProfileRequest = {};
  loading = false;
  saving = false;
  uploading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();
    this.visitorService.getProfile().subscribe({
      next: (profile) => {
        this.loading = false;
        this.profile = profile;
        this.editForm = {
          fullName: profile.fullName,
          phone: profile.phone,
          address: profile.address,
          nationalId: profile.nationalId,
          organization: profile.organization,
          gender: profile.gender,
        };
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.message || 'Failed to load your profile. Please try again.';
        this.cdr.markForCheck();
      },
    });
  }

  onSave(): void {
    if (this.saving) return;
    if (!this.editForm.fullName?.trim()) {
      this.errorMessage = 'Full name is required.';
      return;
    }
    if (!this.editForm.phone?.trim()) {
      this.errorMessage = 'Phone number is required.';
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.cdr.markForCheck();
    const payload: UpdateProfileRequest = {
      fullName: this.editForm.fullName.trim(),
      phone: this.editForm.phone.trim(),
      address: this.editForm.address ?? '',
      nationalId: this.editForm.nationalId ?? '',
      organization: this.editForm.organization ?? '',
      gender: this.editForm.gender ?? '',
    };
    this.visitorService.updateProfile(payload).subscribe({
      next: (profile) => {
        this.saving = false;
        this.profile = profile;
        this.errorMessage = '';
        this.cdr.markForCheck();
        this.snackBar.openFromComponent(ProfileUpdatedToastComponent, {
          duration: 4000,
          panelClass: ['vm-profile-success'],
          verticalPosition: 'top',
          horizontalPosition: 'center',
        });
      },
      error: (err) => {
        this.saving = false;
        this.errorMessage = err.message || 'Failed to update your profile. Please try again.';
        this.cdr.markForCheck();
      },
    });
  }

  onPhotoUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    this.uploading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();
    this.visitorService.uploadPhoto(file).subscribe({
      next: (res) => {
        this.uploading = false;
        if (this.profile) {
          this.profile.photoUrl = res.photoUrl;
        }
        input.value = '';
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.uploading = false;
        input.value = '';
        this.errorMessage = err.message || 'Failed to upload your photo. Please try again.';
        this.cdr.markForCheck();
      },
    });
  }
}
