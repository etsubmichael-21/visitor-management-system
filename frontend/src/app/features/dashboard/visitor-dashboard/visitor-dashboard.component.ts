import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { finalize } from 'rxjs/operators';
import { VisitorService } from '../../../core/services/visitor.service';
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

      // @if (loading) {
      //   <div class="spinner-container">
      //     <mat-spinner diameter="48"></mat-spinner>
      //   </div>
      // }

      @if (errorMessage && !loading) {
        <div class="error-banner">
          <mat-icon>error_outline</mat-icon>
          <span>{{ errorMessage }}</span>
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
              <span class="stat-value">{{ stats.upcomingAppointments }}</span>
              <span class="stat-label">Upcoming Appointments</span>
            </div>
          </div>
          <div class="stat-card stat-active">
            <div class="stat-icon-wrapper">
              <mat-icon>check_circle</mat-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.approvedAppointments }}</span>
              <span class="stat-label">Approved Appointments</span>
            </div>
          </div>
        </div>
      }

      @if (!loading) {
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
  styleUrls: ['./visitor-dashboard.component.scss'],
})
export class VisitorDashboardComponent implements OnInit {
  private visitorService = inject(VisitorService);
  private authService = inject(AuthService);

  loading = true;
  stats: VisitorStats | null = null;
  recentAppointments: Appointment[] = [];
  userName = 'Visitor';
  errorMessage = '';

  ngOnInit(): void {
    const user = this.authService.currentUser;
    if (user) {
      this.userName = `${user.firstName} ${user.lastName}`;
    }

    this.visitorService.getVisitorStats().pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (data) => {
        this.stats = data;
      },
      error: (err) => {
        this.errorMessage = err?.message || 'Failed to load dashboard data. Please try again later.';
        this.stats = null;
      },
    });

    this.visitorService.getVisitorRecentAppointments().subscribe({
      next: (appointments) => {
        this.recentAppointments = appointments;
      },
      error: () => {
        this.recentAppointments = [];
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
