import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AppointmentService } from '../../../core/services/appointment.service';
import { Appointment } from '../../../core/models/appointment.model';

@Component({
  selector: 'app-reschedule',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="reschedule-container">
      <button mat-button routerLink="/appointments/{{ appointmentId }}" class="back-btn">
        <mat-icon>arrow_back</mat-icon>
        Back to Appointment
      </button>

      <h1 class="page-title">Reschedule Appointment</h1>

      @if (errorMessage) {
        <div class="banner error-banner">
          <mat-icon>error</mat-icon>
          <span>{{ errorMessage }}</span>
        </div>
      }

      @if (successMessage) {
        <div class="banner success-banner">
          <mat-icon>check_circle</mat-icon>
          <span>{{ successMessage }}</span>
        </div>
      }

      @if (loading) {
        <div class="spinner-container">
          <mat-spinner diameter="48"></mat-spinner>
        </div>
      } @else if (appointment) {
        <mat-card class="current-info-card">
          <mat-card-header>
            <mat-card-title>Current Appointment</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Purpose</span>
                <span class="info-value">{{ appointment.purpose }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Date</span>
                <span class="info-value">{{ appointment.requestedDate }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Time</span>
                <span class="info-value">{{ appointment.requestedStartTime }}{{ appointment.requestedEndTime ? ' - ' + appointment.requestedEndTime : '' }}</span>
              </div>
              @if (appointment.employeeName) {
                <div class="info-item">
                  <span class="info-label">Employee</span>
                  <span class="info-value">{{ appointment.employeeName }}</span>
                </div>
              }
              @if (appointment.departmentName) {
                <div class="info-item">
                  <span class="info-label">Department</span>
                  <span class="info-value">{{ appointment.departmentName }}</span>
                </div>
              }
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="reschedule-form-card">
          <mat-card-header>
            <mat-card-title>New Schedule</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form (ngSubmit)="onSubmit()" #rescheduleForm="ngForm">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>New Date</mat-label>
                <input matInput
                       [matDatepicker]="picker"
                       [min]="minDate"
                       [(ngModel)]="newDate"
                       name="newDate"
                       required
                       readonly>
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>New Time</mat-label>
                <input matInput
                       type="time"
                       [(ngModel)]="newTime"
                       name="newTime"
                       required>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>New End Time</mat-label>
                <input matInput
                       type="time"
                       [(ngModel)]="newEndTime"
                       name="newEndTime"
                       required>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Reason for Rescheduling</mat-label>
                <textarea matInput
                          [(ngModel)]="reason"
                          name="reason"
                          rows="3"
                          placeholder="Optional - explain why you need to reschedule"></textarea>
              </mat-form-field>

              <div class="form-actions">
                <button mat-button
                        type="button"
                        routerLink="/appointments/{{ appointmentId }}"
                        class="cancel-btn">
                  Cancel
                </button>
                <button mat-raised-button
                        type="submit"
                        [disabled]="submitting || !rescheduleForm.valid"
                        class="submit-btn">
                  @if (submitting) {
                    <mat-spinner diameter="20"></mat-spinner>
                  } @else {
                    Reschedule
                  }
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styleUrls: ['./reschedule.component.scss'],
})
export class RescheduleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private appointmentService = inject(AppointmentService);
  private cdr = inject(ChangeDetectorRef);

  appointmentId: string = '';
  appointment: Appointment | null = null;

  newDate: Date | null = null;
  newTime: string = '';
  newEndTime: string = '';
  reason: string = '';

  minDate: Date = new Date();
  loading: boolean = true;
  submitting: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  ngOnInit(): void {
    this.appointmentId = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.appointmentId) {
      this.loadAppointment();
    } else {
      this.errorMessage = 'Invalid appointment ID.';
      this.loading = false;
    }
  }

  private loadAppointment(): void {
    this.loading = true;
    this.appointmentService.getAppointment(this.appointmentId).subscribe({
      next: (data) => {
        this.appointment = data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to load appointment details.';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  onSubmit(): void {
    if (!this.newDate || !this.newTime || !this.newEndTime) {
      this.errorMessage = 'Please select a new date, start time, and end time.';
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formattedDate = this.formatDate(this.newDate);

    this.appointmentService
      .rescheduleAppointment(this.appointmentId, {
        newDate: formattedDate,
        newStartTime: this.newTime,
        newEndTime: this.newEndTime,
        reason: this.reason || undefined,
      })
      .subscribe({
        next: () => {
          this.successMessage = 'Appointment rescheduled successfully.';
          this.submitting = false;
          this.cdr.markForCheck();
          setTimeout(() => {
            this.router.navigate(['/appointments']);
          }, 1200);
        },
        error: (err) => {
          this.errorMessage =
            (err && (err as any).message) || 'Failed to reschedule appointment. Please try again.';
          this.submitting = false;
          this.cdr.markForCheck();
        },
      });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
