import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { VisitorService } from '../../core/services/visitor.service';
import { VisitorProfile, UpdateProfileRequest } from '../../core/models/visitor.model';

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
                  <img [src]="profile?.photoUrl" alt="Profile">
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

            <form (ngSubmit)="onSave()">
              <mat-form-field appearance="outline">
                <mat-label>Full Name</mat-label>
                <input matInput [(ngModel)]="editForm.fullName" name="fullName">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Phone</mat-label>
                <input matInput [(ngModel)]="editForm.phone" name="phone">
                <mat-icon matPrefix>phone</mat-icon>
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
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .profile-page { max-width: 900px; margin: 0 auto; }

    .page-title {
      font-size: 24px;
      font-weight: 700;
      color: #1b5e20;
      margin-bottom: 24px;
    }

    .profile-grid {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 24px;
    }

    .photo-card { text-align: center; padding: 12px; }

    .photo-section { padding: 20px 0; }

    .avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      overflow: hidden;
    }

    .avatar mat-icon { font-size: 56px; width: 56px; height: 56px; color: #2e7d32; }
    .avatar img { width: 100%; height: 100%; object-fit: cover; }

    .photo-section h3 {
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
    }

    .user-email {
      font-size: 13px;
      color: #64748b;
      margin-top: 2px;
    }

    .user-company {
      font-size: 13px;
      color: #d4a017;
      font-weight: 500;
      margin-top: 4px;
    }

    .upload-section { padding-top: 16px; }

    .details-card { padding: 12px; }

    .details-card h2 {
      font-size: 18px;
      font-weight: 600;
      color: #1b5e20;
      margin-bottom: 20px;
    }

    .section-label {
      font-size: 14px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 20px 0 12px;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 12px;
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
      margin-bottom: 16px;
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
      margin-bottom: 16px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      padding-top: 16px;
    }

    .form-actions button {
      height: 42px;
      padding: 0 28px;
      font-weight: 600;
      background: #2e7d32 !important;
    }

    @media (max-width: 768px) {
      .profile-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class ProfileComponent implements OnInit {
  private visitorService = inject(VisitorService);

  profile: VisitorProfile | null = null;
  editForm: UpdateProfileRequest = {};
  saving = false;
  uploading = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.visitorService.getProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.editForm = {
          fullName: profile.fullName,
          phone: profile.phone,
          address: profile.address,
          nationalId: profile.nationalId,
          organization: profile.organization,
          gender: profile.gender,
        };
      },
      error: () => {},
    });
  }

  onSave(): void {
    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.visitorService.updateProfile(this.editForm).subscribe({
      next: (profile) => {
        this.saving = false;
        this.profile = profile;
        this.successMessage = 'Profile updated successfully!';
        setTimeout(() => (this.successMessage = ''), 3000);
      },
      error: (err) => {
        this.saving = false;
        this.errorMessage = err.message || 'Failed to update profile.';
      },
    });
  }

  onPhotoUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    this.uploading = true;
    this.visitorService.uploadPhoto(file).subscribe({
      next: (res) => {
        this.uploading = false;
        if (this.profile) {
          this.profile.photoUrl = res.photoUrl;
        }
      },
      error: () => {
        this.uploading = false;
      },
    });
  }
}
