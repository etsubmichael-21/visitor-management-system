import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AppointmentService } from '../../../core/services/appointment.service';
import { DepartmentService } from '../../../core/services/department.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { AuthService } from '../../../core/services/auth.service';
import { AppointmentRequest } from '../../../core/models/appointment.model';
import { Department } from '../../../core/models/department.model';
import { Employee } from '../../../core/models/employee.model';

@Component({
  selector: 'app-appointment-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="appointment-form-page fade-in">
      <div class="page-header">
        <a mat-icon-button routerLink="/appointments" class="back-btn" matTooltip="Back to appointments" aria-label="Go back to appointments">
          <mat-icon>arrow_back</mat-icon>
        </a>
        <div>
          <h1 class="page-title">Request Appointment</h1>
          <p class="page-subtitle">Schedule a visit to ECX facilities</p>
        </div>
      </div>

      <mat-card class="form-card">
        <mat-card-content>
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

          <form (ngSubmit)="onSubmit()">
            <div class="form-section">
              <h3 class="section-title">
                <mat-icon>apartment</mat-icon>
                Department & Host
              </h3>

              <mat-form-field appearance="outline">
                <mat-label>Department</mat-label>
                <mat-select [(ngModel)]="departmentId" name="departmentId" required (selectionChange)="onDepartmentChange($event.value)">
                  @for (dept of departments; track dept.id) {
                    <mat-option [value]="dept.id">{{ dept.name }}</mat-option>
                  }
                </mat-select>
                <mat-icon matPrefix>business</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Host Employee</mat-label>
                <mat-select [(ngModel)]="form.employeeId" name="employeeId" required [disabled]="!departmentId">
                  @if (loadingEmployees) {
                    <mat-option disabled>Loading employees...</mat-option>
                  } @else if (!departmentId) {
                    <mat-option value="">Select department first</mat-option>
                  } @else if (employees.length === 0) {
                    <mat-option value="">No employees in this department</mat-option>
                  } @else {
                    @for (emp of employees; track emp.id) {
                      <mat-option [value]="emp.id">{{ emp.fullName }}</mat-option>
                    }
                  }
                </mat-select>
                <mat-icon matPrefix>person</mat-icon>
              </mat-form-field>
            </div>

            <div class="form-section">
              <h3 class="section-title">
                <mat-icon>event</mat-icon>
                Schedule Details
              </h3>

              <mat-form-field appearance="outline">
                <mat-label>Visit Date</mat-label>
                <input matInput [matDatepicker]="picker" [(ngModel)]="selectedDate" name="scheduledDate" required [min]="minDate">
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
              </mat-form-field>

              <div class="time-row">
                <mat-form-field appearance="outline">
                  <mat-label>Start Time</mat-label>
                  <input matInput type="time" [(ngModel)]="form.requestedStartTime" name="requestedStartTime" required>
                  <mat-icon matPrefix>schedule</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>End Time (Optional)</mat-label>
                  <input matInput type="time" [(ngModel)]="form.requestedEndTime" name="requestedEndTime">
                  <mat-icon matPrefix>schedule</mat-icon>
                </mat-form-field>
              </div>
            </div>

            <div class="form-section">
              <h3 class="section-title">
                <mat-icon>description</mat-icon>
                Purpose & Notes
              </h3>

              <mat-form-field appearance="outline">
                <mat-label>Purpose of Visit</mat-label>
                <input matInput [(ngModel)]="form.purpose" name="purpose" required placeholder="e.g. Business Meeting, Interview, Delivery">
                <mat-icon matPrefix>info</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Additional Notes</mat-label>
                <textarea matInput [(ngModel)]="form.notes" name="notes" rows="4" placeholder="Any specific requirements or information for your host..."></textarea>
                <mat-icon matPrefix>notes</mat-icon>
              </mat-form-field>
            </div>

            <div class="form-actions">
              <a mat-stroked-button routerLink="/appointments">Cancel</a>
              <button mat-flat-button color="primary" type="submit" [disabled]="submitting">
                @if (submitting) {
                  <mat-spinner diameter="18"></mat-spinner>
                } @else {
                  <span>Submit Request</span>
                }
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styleUrls: ['./appointment-form.component.scss'],
})
export class AppointmentFormComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  private departmentService = inject(DepartmentService);
  private employeeService = inject(EmployeeService);
  private authService = inject(AuthService);
  private router = inject(Router);

  form: AppointmentRequest = {
    employeeId: 0,
    requestedDate: '',
    requestedStartTime: '',
    requestedEndTime: '',
    purpose: '',
    isConfidential: false,
    notes: '',
  };

  departmentId = 0;

  departments: Department[] = [];
  employees: Employee[] = [];
  loadingEmployees = false;
  selectedDate: Date | null = null;
  minDate = new Date();
  submitting = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.departmentService.getDepartments().subscribe({
      next: (depts) => (this.departments = depts),
      error: () => {
        this.errorMessage = 'Failed to load departments. Make sure you are logged in.';
      },
    });
  }

  onDepartmentChange(deptId: number): void {
    this.form.employeeId = 0;
    this.employees = [];
    if (!deptId) return;

    this.loadingEmployees = true;
    this.employeeService.getByDepartment(deptId).subscribe({
      next: (emps) => {
        this.employees = emps;
        this.loadingEmployees = false;
      },
      error: () => {
        this.employees = [];
        this.loadingEmployees = false;
      },
    });
  }

  onSubmit(): void {
    if (this.selectedDate) {
      const dateStr = this.selectedDate.toISOString().split('T')[0];
      this.form.requestedDate = dateStr;

      const combineToISO = (time: string): string => {
        const [h, m] = time.split(':').map(Number);
        const dt = new Date(this.selectedDate!);
        dt.setHours(h, m, 0, 0);
        return dt.toISOString();
      };

      this.form.requestedStartTime = combineToISO(this.form.requestedStartTime);
      if (this.form.requestedEndTime) {
        this.form.requestedEndTime = combineToISO(this.form.requestedEndTime);
      }
    }
    const user = this.authService.currentUser;
    if (user?.visitorId) {
      this.form.visitorId = user.visitorId;
    }
    this.submitting = true;
    this.errorMessage = '';
    this.appointmentService.createAppointment(this.form).subscribe({
      next: () => {
        this.submitting = false;
        this.successMessage = 'Appointment request submitted successfully!';
        setTimeout(() => this.router.navigate(['/appointments']), 1500);
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err.message || 'Failed to submit appointment request.';
      },
    });
  }
}
