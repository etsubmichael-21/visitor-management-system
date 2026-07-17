import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { VisitorService } from '../../../core/services/visitor.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/services/auth.service';
import { VisitorStats } from '../../../core/models/visitor.model';
import { Appointment } from '../../../core/models/appointment.model';

@Component({
  selector: 'app-visitor-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatListModule,
    MatDividerModule,
  ],
  template: `
    <div class="visitor-dashboard">
      <div class="welcome-banner">
        <div class="welcome-text">
          <h1>Welcome back, {{ userName }}!</h1>
          <p>Here's an overview of your visits and appointments.</p>
        </div>
        <div class="welcome-actions">
          <button mat-raised-button color="primary" routerLink="/appointments/new">
            <mat-icon>add</mat-icon>
            Book Appointment
          </button>
          <button mat-stroked-button routerLink="/visits">
            <mat-icon>history</mat-icon>
            View History
          </button>
        </div>
      </div>

      @if (loading) {
        <div class="spinner-container">
          <mat-spinner diameter="48"></mat-spinner>
        </div>
      }

      @if (!loading && stats) {
        <div class="stats-grid">
          <div class="stat-card stat-total">
            <div class="stat-icon-wrapper">
              <mat-icon>event</mat-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.totalVisits }}</span>
              <span class="stat-label">Total Visits</span>
            </div>
          </div>
          <div class="stat-card stat-pending">
            <div class="stat-icon-wrapper">
              <mat-icon>pending_actions</mat-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.pendingAppointments }}</span>
              <span class="stat-label">Pending Appointments</span>
            </div>
          </div>
          <div class="stat-card stat-upcoming">
            <div class="stat-icon-wrapper">
              <mat-icon>trending_up</mat-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.upcomingVisits }}</span>
              <span class="stat-label">Upcoming Visits</span>
            </div>
          </div>
          <div class="stat-card stat-active">
            <div class="stat-icon-wrapper">
              <mat-icon>check_circle</mat-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.approvedAppointments }}</span>
              <span class="stat-label">Active Visits</span>
            </div>
          </div>
        </div>

        <mat-card class="recent-card">
          <mat-card-header>
            <mat-card-title>Recent Appointments</mat-card-title>
            <a mat-button color="primary" routerLink="/appointments" class="view-all-link">
              View All
              <mat-icon>arrow_forward</mat-icon>
            </a>
          </mat-card-header>
          <mat-divider></mat-divider>
          <mat-card-content>
            @if (recentAppointments.length === 0) {
              <div class="empty-state">
                <mat-icon>event_busy</mat-icon>
                <p>No appointments yet. Book your first appointment to get started.</p>
              </div>
            } @else {
              <mat-list>
                @for (appointment of recentAppointments; track appointment.id) {
                  <mat-list-item class="appointment-item">
                    <div matListItemAvatar class="status-avatar" [class]="'status-' + appointment.status">
                      <mat-icon>{{ getStatusIcon(appointment.status) }}</mat-icon>
                    </div>
                    <div matListItemTitle>{{ appointment.purpose }}</div>
                    <div matListItemLine>
                      @if (appointment.employeeName) {
                        <span class="detail-text">With {{ appointment.employeeName }}</span>
                      }
                      @if (appointment.departmentName) {
                        <span class="detail-text dept"> · {{ appointment.departmentName }}</span>
                      }
                    </div>
                    <div matListItemMeta>
                      <span class="appointment-date">{{ appointment.requestedDate | date:'mediumDate' }}</span>
                      <span class="appointment-time">{{ appointment.requestedStartTime }}</span>
                      <span class="status-badge" [class]="'badge-' + appointment.status">{{ appointment.status }}</span>
                    </div>
                  </mat-list-item>
                  @if (!$last) {
                    <mat-divider></mat-divider>
                  }
                }
              </mat-list>
            }
          </mat-card-content>
        </mat-card>

        <div class="quick-actions">
          <h3>Quick Actions</h3>
          <div class="actions-grid">
            <a mat-raised-button color="primary" routerLink="/appointments/new" class="action-btn">
              <mat-icon>add_circle</mat-icon>
              Book Appointment
            </a>
            <a mat-stroked-button routerLink="/visits" class="action-btn">
              <mat-icon>list_alt</mat-icon>
              View Visit History
            </a>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .visitor-dashboard {
      max-width: 1100px;
      margin: 0 auto;
    }

    .welcome-banner {
      background: linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%);
      border-radius: 12px;
      padding: 2rem;
      color: #fff;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .welcome-text h1 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
    }

    .welcome-text p {
      margin: 0.25rem 0 0;
      opacity: 0.85;
      font-size: 0.9375rem;
    }

    .welcome-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .welcome-actions button {
      background: rgba(255, 255, 255, 0.15) !important;
      color: #fff !important;
      border-color: rgba(255, 255, 255, 0.3) !important;
    }

    .welcome-actions button mat-icon {
      margin-right: 0.375rem;
    }

    .spinner-container {
      display: flex;
      justify-content: center;
      padding: 4rem 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .stat-card {
      background: #fff;
      border-radius: 12px;
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      border-left: 4px solid transparent;
    }

    .stat-total { border-left-color: #1b5e20; }
    .stat-pending { border-left-color: #d4a017; }
    .stat-upcoming { border-left-color: #1565c0; }
    .stat-active { border-left-color: #2e7d32; }

    .stat-icon-wrapper {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .stat-total .stat-icon-wrapper { background: #e8f5e9; color: #1b5e20; }
    .stat-pending .stat-icon-wrapper { background: #fff8e1; color: #d4a017; }
    .stat-upcoming .stat-icon-wrapper { background: #e3f2fd; color: #1565c0; }
    .stat-active .stat-icon-wrapper { background: #e8f5e9; color: #2e7d32; }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: #1e293b;
      line-height: 1.2;
    }

    .stat-label {
      font-size: 0.8125rem;
      color: #64748b;
    }

    .recent-card {
      border-radius: 12px;
      margin-bottom: 1.5rem;
    }

    .recent-card mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.25rem 0;
    }

    .recent-card mat-card-title {
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0;
    }

    .view-all-link {
      font-size: 0.8125rem;
    }

    .view-all-link mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
      margin-left: 0.25rem;
    }

    .recent-card mat-divider {
      margin: 0.75rem 0 0;
    }

    .recent-card mat-card-content {
      padding: 0;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2.5rem 1rem;
      color: #94a3b8;
    }

    .empty-state mat-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      margin-bottom: 0.75rem;
    }

    .empty-state p {
      margin: 0;
      font-size: 0.875rem;
    }

    .appointment-item {
      --mdc-list-item-one-line-container-height: 64px;
    }

    .status-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .status-avatar mat-icon {
      font-size: 1.125rem;
      width: 1.125rem;
      height: 1.125rem;
      color: #fff;
    }

    .status-Pending { background: #d4a017; }
    .status-Approved { background: #2e7d32; }
    .status-Rejected { background: #c62828; }
    .status-Cancelled { background: #94a3b8; }
    .status-Completed { background: #1b5e20; }
    .status-EmployeeUnavailable { background: #e65100; }
    .status-Rescheduled { background: #1565c0; }
    .status-Delegated { background: #6a1b9a; }

    .detail-text {
      font-size: 0.8125rem;
      color: #64748b;
    }

    .detail-text.dept {
      color: #94a3b8;
    }

    .appointment-date {
      display: block;
      font-size: 0.8125rem;
      color: #1e293b;
      text-align: right;
    }

    .appointment-time {
      display: block;
      font-size: 0.75rem;
      color: #94a3b8;
      text-align: right;
    }

    .status-badge {
      display: inline-block;
      margin-top: 0.25rem;
      padding: 0.125rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.6875rem;
      font-weight: 500;
      text-transform: capitalize;
    }

    .badge-Pending { background: #fff8e1; color: #d4a017; }
    .badge-Approved { background: #e8f5e9; color: #2e7d32; }
    .badge-Rejected { background: #ffebee; color: #c62828; }
    .badge-Cancelled { background: #f1f5f9; color: #94a3b8; }
    .badge-Completed { background: #e8f5e9; color: #1b5e20; }
    .badge-EmployeeUnavailable { background: #fff3e0; color: #e65100; }
    .badge-Rescheduled { background: #e3f2fd; color: #1565c0; }
    .badge-Delegated { background: #f3e5f5; color: #6a1b9a; }

    .quick-actions {
      margin-bottom: 2rem;
    }

    .quick-actions h3 {
      margin: 0 0 1rem;
      font-size: 1.125rem;
      font-weight: 600;
      color: #1e293b;
    }

    .actions-grid {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .action-btn {
      border-radius: 8px !important;
      padding: 0.5rem 1.5rem !important;
    }

    .action-btn mat-icon {
      margin-right: 0.375rem;
    }
  `],
})
export class VisitorDashboardComponent implements OnInit {
  private visitorService = inject(VisitorService);
  private appointmentService = inject(AppointmentService);
  private authService = inject(AuthService);

  loading = true;
  stats: VisitorStats | null = null;
  recentAppointments: Appointment[] = [];
  userName = 'Visitor';

  ngOnInit(): void {
    const user = this.authService.currentUser;
    if (user) {
      this.userName = `${user.firstName} ${user.lastName}`;
    }

    this.visitorService.getVisitorStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });

    this.appointmentService.getAppointments({ page: 1, pageSize: 5 }).subscribe({
      next: (response) => {
        this.recentAppointments = response.items;
      },
    });
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      Pending: 'schedule',
      Approved: 'check_circle',
      Rejected: 'cancel',
      Cancelled: 'block',
      Completed: 'task_alt',
      EmployeeUnavailable: 'event_busy',
      Rescheduled: 'event_repeat',
      Delegated: 'swap_horiz',
    };
    return icons[status] || 'help';
  }
}
