import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AppointmentService } from '../../../core/services/appointment.service';
import { Appointment } from '../../../core/models/appointment.model';

@Component({
  selector: 'app-appointment-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDividerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="appointment-detail-page fade-in">
      <div class="page-header">
        <a mat-icon-button routerLink="/appointments" class="back-btn" matTooltip="Back to appointments" aria-label="Go back to appointments">
          <mat-icon>arrow_back</mat-icon>
        </a>
        <div>
          <h1 class="page-title">Appointment Details</h1>
          <p class="page-subtitle">Appointment #{{ appointment?.id?.substring(0, 8) || '...' }}</p>
        </div>
      </div>

      @if (loading) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      }

      @if (!loading && appointment) {
        <div class="detail-content">
          <mat-card class="status-card">
            <mat-card-content>
              <div class="status-header">
                <span class="status-badge" [class]="appointment.status">{{ appointment.status }}</span>
                @if (appointment.status === 'Pending' || appointment.status === 'Approved') {
                  <div class="action-buttons">
                    <button mat-stroked-button color="warn" (click)="cancelAppointment()" [disabled]="cancelling">
                      <mat-icon>cancel</mat-icon> Cancel
                    </button>
                    @if (appointment.status === 'Approved') {
                      <a mat-stroked-button color="primary" [routerLink]="['/appointments', appointment.id, 'reschedule']">
                        <mat-icon>event_repeat</mat-icon> Reschedule
                      </a>
                    }
                  </div>
                }
              </div>
            </mat-card-content>
          </mat-card>

          <div class="detail-grid">
            <mat-card class="info-card">
              <mat-card-content>
                <h3>
                  <mat-icon>event</mat-icon>
                  Visit Information
                </h3>
                <div class="info-row">
                  <span class="info-label">Purpose</span>
                  <span class="info-value">{{ appointment.purpose }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Date</span>
                  <span class="info-value">{{ appointment.requestedDate | date:'fullDate' }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Time</span>
                  <span class="info-value">{{ appointment.requestedStartTime }}{{ appointment.requestedEndTime ? ' - ' + appointment.requestedEndTime : '' }}</span>
                </div>
                @if (appointment.notes) {
                  <div class="info-row">
                    <span class="info-label">Notes</span>
                    <span class="info-value">{{ appointment.notes }}</span>
                  </div>
                }
              </mat-card-content>
            </mat-card>

            <mat-card class="info-card">
              <mat-card-content>
                <h3>
                  <mat-icon>business</mat-icon>
                  Host Information
                </h3>
                <div class="info-row">
                  <span class="info-label">Host</span>
                  <span class="info-value">{{ appointment.employeeName || 'N/A' }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Department</span>
                  <span class="info-value">{{ appointment.departmentName || 'N/A' }}</span>
                </div>
              </mat-card-content>
            </mat-card>

            @if (appointment.rejectionReason) {
              <mat-card class="info-card">
                <mat-card-content>
                  <h3>
                    <mat-icon style="color: #c62828;">info</mat-icon>
                    Rejection Reason
                  </h3>
                  <p class="rejection-text">{{ appointment.rejectionReason }}</p>
                </mat-card-content>
              </mat-card>
            }

          </div>
        </div>
      }

      @if (showCancelDialog) {
        <div class="cancel-dialog">
          <mat-card>
            <mat-card-content>
              <h3>Cancel Appointment</h3>
              <p>Please provide a reason for cancellation:</p>
              <mat-form-field appearance="outline">
                <textarea matInput [(ngModel)]="cancelReason" rows="3" placeholder="Reason for cancellation..."></textarea>
              </mat-form-field>
              <div class="dialog-actions">
                <button mat-button (click)="showCancelDialog = false">Keep Appointment</button>
                <button mat-flat-button color="warn" (click)="confirmCancel()" [disabled]="cancelling">
                  @if (cancelling) {
                    <mat-spinner diameter="16"></mat-spinner>
                  } @else {
                    <span>Confirm Cancel</span>
                  }
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      }
    </div>
  `,
  styleUrls: ['./appointment-detail.component.scss'],
})
export class AppointmentDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private appointmentService = inject(AppointmentService);

  appointment: Appointment | null = null;
  loading = true;
  cancelling = false;
  showCancelDialog = false;
  cancelReason = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.appointmentService.getAppointment(id).subscribe({
        next: (apt) => {
          this.appointment = apt;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
    }
  }

  cancelAppointment(): void {
    this.showCancelDialog = true;
  }

  confirmCancel(): void {
    if (!this.appointment) return;
    this.cancelling = true;
    this.appointmentService.cancelAppointment(this.appointment.id, this.cancelReason).subscribe({
      next: (apt) => {
        this.appointment = apt;
        this.cancelling = false;
        this.showCancelDialog = false;
        this.cancelReason = '';
      },
      error: () => {
        this.cancelling = false;
      },
    });
  }
}
