import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/services/auth.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { Appointment } from '../../../core/models/appointment.model';
import { Employee } from '../../../core/models/employee.model';

@Component({
  selector: 'app-appointment-detail',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule,
    MatCardModule, MatIconModule, MatButtonModule, MatDividerModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatDialogModule, MatSnackBarModule
  ],
  template: `
    <div class="appointment-detail">
      <div class="page-header">
        <h1>Appointment Details</h1>
        <a mat-stroked-button color="primary" (click)="goBack()">
          <mat-icon>arrow_back</mat-icon> Back
        </a>
      </div>

      @if (appointment()) {
        <div class="detail-grid">
          <mat-card class="main-card">
            <mat-card-content>
              <div class="apt-header">
                <div>
                  <h2>{{ appointment()!.purpose }}</h2>
                  <span class="ecx-status-badge" [ngClass]="appointment()!.status.toLowerCase()">{{ appointment()!.status }}</span>
                  @if (appointment()!.isConfidential) {
                    <mat-icon class="confidential">lock</mat-icon>
                    <span class="confidential-label">Confidential</span>
                  }
                </div>
              </div>

              <mat-divider></mat-divider>

              <div class="info-grid">
                <div class="info-item"><small>Visitor</small><p>{{ appointment()!.visitorName }}</p></div>
                <div class="info-item"><small>Visitor Email</small><p>{{ appointment()!.visitorEmail }}</p></div>
                <div class="info-item"><small>Visitor Phone</small><p>{{ appointment()!.visitorPhone }}</p></div>
                <div class="info-item"><small>Date</small><p>{{ appointment()!.requestedDate }}</p></div>
                <div class="info-item"><small>Time</small><p>{{ appointment()!.requestedStartTime }} - {{ appointment()!.requestedEndTime }}</p></div>
                <div class="info-item"><small>Host</small><p>{{ appointment()!.employeeName || 'N/A' }}</p></div>
                <div class="info-item"><small>Department</small><p>{{ appointment()!.departmentName || 'N/A' }}</p></div>
                <div class="info-item"><small>Purpose</small><p>{{ appointment()!.purpose }}</p></div>
                <div class="info-item"><small>Comments</small><p>{{ appointment()!.commentCount }}</p></div>
                @if (appointment()!.notes) {
                  <div class="info-item full"><small>Notes</small><p>{{ appointment()!.notes }}</p></div>
                }
                @if (appointment()!.rejectionReason) {
                  <div class="info-item full rejection"><small>Rejection Reason</small><p>{{ appointment()!.rejectionReason }}</p></div>
                }
                @if (appointment()!.delegatedToEmployeeName) {
                  <div class="info-item"><small>Delegated To</small><p>{{ appointment()!.delegatedToEmployeeName }}</p></div>
                }
              </div>
            </mat-card-content>
          </mat-card>

          <div class="action-panel">
            <mat-card>
              <mat-card-header><mat-card-title>Actions</mat-card-title></mat-card-header>
              <mat-card-content>
                @if (appointment()!.status === 'Pending' && canApprove()) {
                  <button mat-raised-button color="primary" class="action-btn" (click)="approveAppointment()">
                    <mat-icon>check_circle</mat-icon> Approve
                  </button>
                  <button mat-raised-button color="warn" class="action-btn" (click)="showRejectForm.set(true)">
                    <mat-icon>cancel</mat-icon> Reject
                  </button>
                  <button mat-stroked-button color="primary" class="action-btn" (click)="showDelegateForm.set(true)">
                    <mat-icon>forward</mat-icon> Delegate
                  </button>
                }
                @if (appointment()!.status === 'Approved' && canApprove()) {
                  <button mat-raised-button color="primary" class="action-btn" (click)="completeAppointment()">
                    <mat-icon>done_all</mat-icon> Mark Complete
                  </button>
                }
                @if ((appointment()!.status === 'Pending' || appointment()!.status === 'Approved') && isHost()) {
                  <button mat-stroked-button color="warn" class="action-btn" (click)="cancelAppointment()">
                    <mat-icon>cancel</mat-icon> Cancel
                  </button>
                }
              </mat-card-content>
            </mat-card>

            @if (showRejectForm()) {
              <mat-card>
                <mat-card-header><mat-card-title>Rejection Reason</mat-card-title></mat-card-header>
                <mat-card-content>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Reason</mat-label>
                    <textarea matInput [(ngModel)]="rejectReason" rows="3"></textarea>
                  </mat-form-field>
                  <div class="form-actions">
                    <button mat-stroked-button (click)="showRejectForm.set(false)">Cancel</button>
                    <button mat-raised-button color="warn" (click)="rejectAppointment()" [disabled]="!rejectReason">Reject</button>
                  </div>
                </mat-card-content>
              </mat-card>
            }

            @if (showDelegateForm()) {
              <mat-card>
                <mat-card-header><mat-card-title>Delegate To</mat-card-title></mat-card-header>
                <mat-card-content>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Select Employee</mat-label>
                    <mat-select [(ngModel)]="delegateEmployeeId">
                      @for (emp of employees(); track emp.id) {
                        <mat-option [value]="emp.id">{{ emp.fullName }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Notes</mat-label>
                    <textarea matInput [(ngModel)]="delegateNotes" rows="2"></textarea>
                  </mat-form-field>
                  <div class="form-actions">
                    <button mat-stroked-button (click)="showDelegateForm.set(false)">Cancel</button>
                    <button mat-raised-button color="primary" (click)="delegateAppointment()" [disabled]="!delegateEmployeeId">Delegate</button>
                  </div>
                </mat-card-content>
              </mat-card>
            }

            <mat-card>
              <mat-card-header><mat-card-title>Timeline</mat-card-title></mat-card-header>
              <mat-card-content>
                <div class="timeline">
                  <div class="timeline-item">
                    <div class="timeline-dot" style="background: #0F6B3A;"></div>
                    <div><small>Created</small><p>{{ appointment()!.createdAt }}</p></div>
                  </div>
                  @if (appointment()!.updatedAt) {
                    <div class="timeline-item">
                      <div class="timeline-dot" style="background: #0F6B3A;"></div>
                      <div><small>Last Updated</small><p>{{ appointment()!.updatedAt }}</p></div>
                    </div>
                  }
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </div>
      }
    </div>
  `,
  styleUrls: ['./appointment-detail.component.scss']
})
export class AppointmentDetailComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  private authService = inject(AuthService);
  private employeeService = inject(EmployeeService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  appointment = signal<Appointment | null>(null);
  employees = signal<Employee[]>([]);
  showRejectForm = signal(false);
  showDelegateForm = signal(false);
  rejectReason = '';
  delegateEmployeeId: number | null = null;
  delegateNotes = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadAppointment(Number(id));

    this.employeeService.getAll({ limit: 200 }).subscribe({
      next: (res) => { if (res.success && res.data) this.employees.set(res.data.items || []); }
    });
  }

  loadAppointment(id: number): void {
    this.appointmentService.getById(id).subscribe({
      next: (res) => { if (res.success) this.appointment.set(res.data); }
    });
  }

  canApprove(): boolean {
    const role = this.authService.getUserRole();
    return role === 'Admin' || role === 'CEO' || role === 'DepartmentHead';
  }

  isHost(): boolean {
    const user = this.authService.getCurrentUser();
    const apt = this.appointment();
    return user != null && apt != null && (user.employeeId === apt.employeeId || user.role === 'Admin');
  }

  approveAppointment(): void {
    const apt = this.appointment();
    if (!apt) return;
    this.appointmentService.approve({ appointmentId: apt.id }).subscribe({
      next: (res) => {
        if (res.success) { this.snackBar.open('Appointment approved', 'Close', { duration: 3000 }); this.loadAppointment(apt.id); }
      },
      error: () => this.snackBar.open('Failed to approve', 'Close', { duration: 3000 })
    });
  }

  rejectAppointment(): void {
    const apt = this.appointment();
    if (!apt || !this.rejectReason) return;
    this.appointmentService.reject({ appointmentId: apt.id, reason: this.rejectReason }).subscribe({
      next: (res) => {
        if (res.success) { this.snackBar.open('Appointment rejected', 'Close', { duration: 3000 }); this.showRejectForm.set(false); this.loadAppointment(apt.id); }
      }
    });
  }

  delegateAppointment(): void {
    const apt = this.appointment();
    if (!apt || !this.delegateEmployeeId) return;
    this.appointmentService.delegate({ appointmentId: apt.id, delegateToEmployeeId: this.delegateEmployeeId, notes: this.delegateNotes }).subscribe({
      next: (res) => {
        if (res.success) { this.snackBar.open('Appointment delegated', 'Close', { duration: 3000 }); this.showDelegateForm.set(false); this.loadAppointment(apt.id); }
      }
    });
  }

  completeAppointment(): void {
    const apt = this.appointment();
    if (!apt) return;
    this.appointmentService.complete(apt.id).subscribe({
      next: (res) => { if (res.success) { this.snackBar.open('Marked as complete', 'Close', { duration: 3000 }); this.loadAppointment(apt.id); } }
    });
  }

  cancelAppointment(): void {
    const apt = this.appointment();
    if (!apt) return;
    this.appointmentService.cancel(apt.id).subscribe({
      next: (res) => { if (res.success) { this.snackBar.open('Appointment cancelled', 'Close', { duration: 3000 }); this.loadAppointment(apt.id); } }
    });
  }

  goBack(): void { window.history.back(); }
}
