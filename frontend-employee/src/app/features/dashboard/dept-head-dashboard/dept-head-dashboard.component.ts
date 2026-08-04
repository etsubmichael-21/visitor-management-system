import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DashboardService } from '../../../core/services/dashboard.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { AuthService } from '../../../core/services/auth.service';
import { DeptHeadDashboardData, DeptHeadPendingAppointment } from '../../../core/models/dashboard.model';
import { Employee } from '../../../core/models/employee.model';

@Component({
  selector: 'app-dept-head-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule,
    MatCardModule, MatIconModule, MatButtonModule,
    MatSelectModule, MatFormFieldModule, MatSnackBarModule
  ],
  template: `
    <div class="dept-dashboard">
      <div class="welcome-banner">
        <h2>Welcome, {{ userName() }}!</h2>
        <p>{{ dashboardData()?.departmentName || 'Your department' }} overview</p>
      </div>

      <div class="stat-row">
        <div class="stat-card" style="border-left: 4px solid #1565c0;">
          <div class="stat-icon" style="background: #e3f2fd; color: #1565c0;"><mat-icon>assignment_late</mat-icon></div>
          <div class="stat-info">
            <h3>{{ dashboardData()?.pendingAppointments || 0 }}</h3>
            <p>Awaiting Assignment</p>
          </div>
        </div>
        <div class="stat-card" style="border-left: 4px solid #0F6B3A;">
          <div class="stat-icon" style="background: #e8f5e9; color: #0F6B3A;"><mat-icon>pending_actions</mat-icon></div>
          <div class="stat-info">
            <h3>{{ dashboardData()?.assignedPendingAppointments || 0 }}</h3>
            <p>Assigned - Pending Decision</p>
          </div>
        </div>
        <div class="stat-card" style="border-left: 4px solid #7b1fa2;">
          <div class="stat-icon" style="background: #f3e5f5; color: #7b1fa2;"><mat-icon>people_outline</mat-icon></div>
          <div class="stat-info">
            <h3>{{ dashboardData()?.totalEmployees || 0 }}</h3>
            <p>Team Members</p>
          </div>
        </div>
        <div class="stat-card" style="border-left: 4px solid #D4A017;">
          <div class="stat-icon" style="background: #fff8e1; color: #D4A017;"><mat-icon>groups</mat-icon></div>
          <div class="stat-info">
            <h3>{{ dashboardData()?.totalVisitorsThisMonth || 0 }}</h3>
            <p>Visitors This Month</p>
          </div>
        </div>
      </div>

      <mat-card>
        <mat-card-header>
          <mat-card-title>Pending Appointments</mat-card-title>
          <button mat-button color="primary" routerLink="/dept/appointments">View All</button>
        </mat-card-header>
        <mat-card-content>
          @for (apt of dashboardData()?.pendingAppointmentsList || []; track apt.id) {
            <div class="apt-item">
              <div class="apt-info">
                <strong>{{ apt.visitorName }}</strong>
                <p>{{ apt.purpose }}</p>
                <small>{{ apt.requestedDate }} &middot; {{ apt.requestedStartTime }} - {{ apt.requestedEndTime }}</small>
              </div>
              <div class="apt-assign">
                @if (apt.assignedEmployeeName) {
                  <span class="assignee-chip">
                    <mat-icon>person_pin</mat-icon> {{ apt.assignedEmployeeName }}
                  </span>
                } @else {
                  <span class="assignee-chip unassigned">Unassigned</span>
                }
              </div>
              <div class="apt-actions">
                @if (!apt.assignedEmployeeId) {
                  <mat-form-field appearance="outline" class="assign-select">
                    <mat-select [ngModel]="selectedAssignee()[apt.id]" (ngModelChange)="onAssigneeChange(apt.id, $event)">
                      <mat-option [value]="null">Select</mat-option>
                      @for (emp of assignableEmployees(); track emp.id) {
                        <mat-option [value]="emp.id">{{ emp.fullName }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>
                  <button mat-raised-button color="primary" [disabled]="!selectedAssignee()[apt.id]" (click)="assignAppointment(apt)">
                    <mat-icon>assignment_ind</mat-icon> Assign
                  </button>
                }
                <button mat-stroked-button [routerLink]="['/appointments', apt.id]">
                  <mat-icon>visibility</mat-icon> View
                </button>
              </div>
            </div>
          }
          @if (!dashboardData()?.pendingAppointmentsList?.length) {
            <p class="empty-state">No pending appointments in your department</p>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styleUrls: ['./dept-head-dashboard.component.scss']
})
export class DeptHeadDashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private appointmentService = inject(AppointmentService);
  private employeeService = inject(EmployeeService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  dashboardData = signal<DeptHeadDashboardData | null>(null);
  userName = signal('');
  employees = signal<Employee[]>([]);
  selectedAssignee = signal<Record<number, number | null>>({});

  assignableEmployees = () =>
    this.employees().filter(e => e.departmentId === this.dashboardData()?.departmentId && e.status === 'Active');

  onAssigneeChange(appointmentId: number, employeeId: number | null): void {
    this.selectedAssignee.set({ ...this.selectedAssignee(), [appointmentId]: employeeId });
  }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.userName.set(user ? user.fullName : '');

    this.loadDashboard();

    this.employeeService.getAll({ limit: 200 }).subscribe({
      next: (res) => { if (res.success && res.data) this.employees.set(res.data.items || []); },
      error: () => { /* employee list is non-critical for rendering */ }
    });
  }

  private loadDashboard(): void {
    this.dashboardService.getDeptHeadDashboard().subscribe({
      next: (res) => { if (res.success && res.data) this.dashboardData.set(res.data); },
      error: () => this.snackBar.open('Failed to load department dashboard', 'Close', { duration: 3000 })
    });
  }

  assignAppointment(apt: DeptHeadPendingAppointment): void {
    const employeeId = this.selectedAssignee()[apt.id];
    if (!employeeId) return;

    this.appointmentService.assignEmployee({ appointmentId: apt.id, newEmployeeId: employeeId }).subscribe({
      next: (res) => {
        if (res.success) {
          this.snackBar.open('Employee assigned to appointment', 'Close', { duration: 3000 });
          this.loadDashboard();
        }
      },
      error: () => this.snackBar.open('Failed to assign employee', 'Close', { duration: 3000 })
    });
  }
}
