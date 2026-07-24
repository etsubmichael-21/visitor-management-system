import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/services/auth.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { Appointment } from '../../../core/models/appointment.model';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatIconModule, MatButtonModule],
  template: `
    <div class="emp-dashboard">
      <div class="welcome-banner">
        <h2>Welcome, {{ userName() }}!</h2>
        <p>Manage your appointments and visitor requests.</p>
      </div>

      <div class="stat-row">
        <div class="stat-card" style="border-left: 4px solid #0F6B3A;">
          <div class="stat-icon" style="background: #e8f5e9; color: #0F6B3A;"><mat-icon>event</mat-icon></div>
          <div class="stat-info">
            <h3>{{ myAppointments().length }}</h3>
            <p>My Appointments</p>
          </div>
        </div>
        <div class="stat-card" style="border-left: 4px solid #D4A017;">
          <div class="stat-icon" style="background: #fff8e1; color: #D4A017;"><mat-icon>pending</mat-icon></div>
          <div class="stat-info">
            <h3>{{ pendingCount() }}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div class="stat-card" style="border-left: 4px solid #1565c0;">
          <div class="stat-icon" style="background: #e3f2fd; color: #1565c0;"><mat-icon>check_circle</mat-icon></div>
          <div class="stat-info">
            <h3>{{ approvedCount() }}</h3>
            <p>Approved</p>
          </div>
        </div>
        <div class="stat-card" style="border-left: 4px solid #7b1fa2;">
          <div class="stat-icon" style="background: #f3e5f5; color: #7b1fa2;"><mat-icon>history</mat-icon></div>
          <div class="stat-info">
            <h3>{{ completedCount() }}</h3>
            <p>Completed</p>
          </div>
        </div>
      </div>

      <div class="actions-row">
        <mat-card>
          <mat-card-header><mat-card-title>Quick Actions</mat-card-title></mat-card-header>
          <mat-card-content>
            <div class="action-buttons">
              <button mat-raised-button color="primary" routerLink="/emp/appointments">
                <mat-icon>add</mat-icon> New Appointment
              </button>
              <button mat-stroked-button color="primary" routerLink="/emp/calendar">
                <mat-icon>calendar_today</mat-icon> View Calendar
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-card class="appointments-card">
        <mat-card-header>
          <mat-card-title>My Upcoming Appointments</mat-card-title>
          <button mat-button color="primary" routerLink="/emp/appointments">View All</button>
        </mat-card-header>
        <mat-card-content>
          @for (apt of myAppointments(); track apt.id) {
            <div class="apt-item" [routerLink]="['/appointments', apt.id]" style="cursor: pointer;">
              <div class="apt-date">
                <strong>{{ apt.requestedDate }}</strong>
                <small>{{ apt.requestedStartTime }}</small>
              </div>
              <div class="apt-info">
                <strong>{{ apt.purpose }}</strong>
                <p>Visitor: {{ apt.visitorName }}</p>
              </div>
              <span class="ecx-status-badge" [ngClass]="apt.status.toLowerCase()">{{ apt.status }}</span>
            </div>
          }
          @if (!myAppointments().length) {
            <div class="empty-state">
              <mat-icon>event_busy</mat-icon>
              <p>No appointments found</p>
            </div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styleUrls: ['./employee-dashboard.component.scss']
})
export class EmployeeDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private appointmentService = inject(AppointmentService);

  userName = signal('');
  myAppointments = signal<Appointment[]>([]);
  pendingCount = signal(0);
  approvedCount = signal(0);
  completedCount = signal(0);

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.userName.set(user ? user.fullName : '');

    this.appointmentService.getAll({ page: 1, limit: 20 }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.myAppointments.set(res.data.items || []);
          this.pendingCount.set(res.data.items?.filter((a: Appointment) => a.status === 'Pending').length || 0);
          this.approvedCount.set(res.data.items?.filter((a: Appointment) => a.status === 'Approved').length || 0);
          this.completedCount.set(res.data.items?.filter((a: Appointment) => a.status === 'Completed').length || 0);
        }
      },
      error: () => {
        this.myAppointments.set([]);
      }
    });
  }
}
