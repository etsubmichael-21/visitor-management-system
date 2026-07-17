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
        <div class="stat-card" style="border-left: 4px solid #2e7d32;">
          <div class="stat-icon" style="background: #e8f5e9; color: #2e7d32;"><mat-icon>event</mat-icon></div>
          <div class="stat-info">
            <h3>{{ myAppointments().length }}</h3>
            <p>My Appointments</p>
          </div>
        </div>
        <div class="stat-card" style="border-left: 4px solid #f9a825;">
          <div class="stat-icon" style="background: #fff8e1; color: #f9a825;"><mat-icon>pending</mat-icon></div>
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
  styles: [`
    .welcome-banner { margin-bottom: 24px; }
    .welcome-banner h2 { font-size: 24px; color: #1a237e; margin: 0; }
    .welcome-banner p { color: #666; margin-top: 4px; }
    .stat-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .stat-card { background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); padding: 20px; display: flex; align-items: center; gap: 16px; }
    .stat-icon { width: 56px; height: 56px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .stat-icon mat-icon { font-size: 28px; }
    .stat-info h3 { font-size: 28px; font-weight: 700; margin: 0; }
    .stat-info p { font-size: 13px; color: #666; margin: 4px 0 0; }
    .actions-row { margin-bottom: 24px; }
    .action-buttons { display: flex; gap: 12px; flex-wrap: wrap; }
    .action-buttons button { display: flex; align-items: center; gap: 8px; }
    .apt-item { display: flex; align-items: center; gap: 16px; padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
    .apt-item:last-child { border-bottom: none; }
    .apt-date { min-width: 80px; text-align: center; }
    .apt-date strong { font-size: 13px; display: block; color: #1a237e; }
    .apt-date small { font-size: 11px; color: #666; }
    .apt-info { flex: 1; }
    .apt-info strong { font-size: 14px; display: block; }
    .apt-info p { font-size: 12px; color: #666; margin: 2px 0; }
    .empty-state { text-align: center; color: #999; padding: 40px; }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; color: #ddd; }
  `]
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
