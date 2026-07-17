import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DashboardService } from '../../../core/services/dashboard.service';
import { DashboardData } from '../../../core/models/dashboard.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dept-head-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatIconModule, MatButtonModule],
  template: `
    <div class="dept-dashboard">
      <div class="welcome-banner">
        <h2>Welcome, {{ userName() }}!</h2>
        <p>Here's your department overview for today.</p>
      </div>

      <div class="stat-row">
        <div class="stat-card" style="border-left: 4px solid #2e7d32;">
          <div class="stat-icon" style="background: #e8f5e9; color: #2e7d32;"><mat-icon>event_available</mat-icon></div>
          <div class="stat-info">
            <h3>{{ dashboardData()?.stats?.totalVisitorsToday || 0 }}</h3>
            <p>Today's Visitors</p>
          </div>
        </div>
        <div class="stat-card" style="border-left: 4px solid #1565c0;">
          <div class="stat-icon" style="background: #e3f2fd; color: #1565c0;"><mat-icon>pending_actions</mat-icon></div>
          <div class="stat-info">
            <h3>{{ dashboardData()?.stats?.pendingAppointments || 0 }}</h3>
            <p>Pending Approvals</p>
          </div>
        </div>
        <div class="stat-card" style="border-left: 4px solid #f9a825;">
          <div class="stat-icon" style="background: #fff8e1; color: #f9a825;"><mat-icon>people</mat-icon></div>
          <div class="stat-info">
            <h3>{{ dashboardData()?.stats?.checkedInVisitors || 0 }}</h3>
            <p>Active Visitors</p>
          </div>
        </div>
        <div class="stat-card" style="border-left: 4px solid #7b1fa2;">
          <div class="stat-icon" style="background: #f3e5f5; color: #7b1fa2;"><mat-icon>people_outline</mat-icon></div>
          <div class="stat-info">
            <h3>{{ dashboardData()?.stats?.totalEmployees || 0 }}</h3>
            <p>Team Members</p>
          </div>
        </div>
      </div>

      <div class="content-row">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Pending Appointments</mat-card-title>
            <button mat-button color="primary" routerLink="/dept/appointments">View All</button>
          </mat-card-header>
          <mat-card-content>
            @for (apt of dashboardData()?.todayAppointments || []; track apt.id) {
              <div class="apt-item">
                <div class="apt-time">{{ apt.time }}</div>
                <div class="apt-info">
                  <strong>{{ apt.visitorName }}</strong>
                  <p>{{ apt.purpose }}</p>
                </div>
                <span class="ecx-status-badge" [ngClass]="apt.status.toLowerCase()">{{ apt.status }}</span>
              </div>
            }
            @if (!dashboardData()?.todayAppointments?.length) {
              <p class="empty-state">No pending appointments</p>
            }
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-card-title>Active Visitors</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            @for (v of dashboardData()?.activeVisitors || []; track v.id) {
              <div class="visitor-item">
                <div class="visitor-info">
                  <strong>{{ v.visitorName }}</strong>
                  <p>Visiting {{ v.hostName }} | Floor: {{ v.floor || 'N/A' }}</p>
                  <small>Checked in: {{ v.checkInTime }}</small>
                </div>
                <span class="badge" *ngIf="v.badgeNumber">{{ v.badgeNumber }}</span>
              </div>
            }
            @if (!dashboardData()?.activeVisitors?.length) {
              <p class="empty-state">No active visitors</p>
            }
          </mat-card-content>
        </mat-card>
      </div>

      <mat-card class="activity-card">
        <mat-card-header><mat-card-title>Recent Activity</mat-card-title></mat-card-header>
        <mat-card-content>
          @for (activity of dashboardData()?.recentActivities || []; track activity.id) {
            <div class="activity-item">
              <mat-icon [style.color]="activity.color">{{ activity.icon }}</mat-icon>
              <div>
                <strong>{{ activity.title }}</strong>
                <p>{{ activity.description }}</p>
                <small>{{ activity.timestamp }}</small>
              </div>
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
    .stat-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .stat-card { background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); padding: 20px; display: flex; align-items: center; gap: 16px; }
    .stat-icon { width: 56px; height: 56px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .stat-icon mat-icon { font-size: 28px; }
    .stat-info h3 { font-size: 28px; font-weight: 700; margin: 0; }
    .stat-info p { font-size: 13px; color: #666; margin: 4px 0 0; }
    .content-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .apt-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
    .apt-item:last-child { border-bottom: none; }
    .apt-time { font-weight: 600; color: #1a237e; min-width: 60px; font-size: 13px; }
    .apt-info { flex: 1; }
    .apt-info strong { font-size: 14px; display: block; }
    .apt-info p { font-size: 12px; color: #666; margin: 2px 0; }
    .visitor-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
    .visitor-item:last-child { border-bottom: none; }
    .visitor-info strong { font-size: 14px; display: block; }
    .visitor-info p { font-size: 12px; color: #666; margin: 2px 0; }
    .visitor-info small { font-size: 11px; color: #999; }
    .badge { background: #e8f5e9; color: #2e7d32; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
    .activity-card { margin-bottom: 16px; }
    .activity-item { display: flex; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f0f0f0; align-items: flex-start; }
    .activity-item:last-child { border-bottom: none; }
    .activity-item div { flex: 1; }
    .activity-item strong { font-size: 14px; display: block; }
    .activity-item p { font-size: 12px; color: #666; margin: 2px 0; }
    .activity-item small { font-size: 11px; color: #999; }
    .empty-state { text-align: center; color: #999; padding: 24px; }
    @media (max-width: 768px) { .content-row { grid-template-columns: 1fr; } }
  `]
})
export class DeptHeadDashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private authService = inject(AuthService);
  dashboardData = signal<DashboardData | null>(null);
  userName = signal('');

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.userName.set(user ? user.fullName : '');

    this.dashboardService.getDeptHeadDashboard().subscribe({
      next: (res) => { if (res.success) this.dashboardData.set(res.data); },
      error: () => {
        this.dashboardData.set({
          stats: { totalVisitorsToday: 12, totalVisitorsThisWeek: 60, totalVisitorsThisMonth: 180, activeAppointments: 95, pendingAppointments: 5, checkedInVisitors: 4, totalEmployees: 15, totalDepartments: 1, unreadNotifications: 1 },
          visitorChart: { labels: [], data: [], type: 'weekly' }, departmentChart: { labels: [], data: [], type: 'weekly' },
          hourlyTraffic: [], recentActivities: [], todayAppointments: [], activeVisitors: [], pendingApprovals: 5, confidentialAppointments: 0
        });
      }
    });
  }
}
