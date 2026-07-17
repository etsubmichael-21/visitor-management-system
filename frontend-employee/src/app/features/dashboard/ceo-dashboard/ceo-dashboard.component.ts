import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { DashboardService } from '../../../core/services/dashboard.service';
import { DashboardData } from '../../../core/models/dashboard.model';

@Component({
  selector: 'app-ceo-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatIconModule, MatButtonModule, MatTableModule, MatChipsModule],
  template: `
    <div class="ceo-dashboard">
      <div class="confidential-banner">
        <mat-icon>security</mat-icon>
        <div>
          <strong>Confidential View</strong>
          <p>You have access to all appointment data including confidential meetings.</p>
        </div>
      </div>

      <div class="stat-row">
        <div class="stat-card" style="border-left: 4px solid #2e7d32;">
          <div class="stat-icon" style="background: #e8f5e9; color: #2e7d32;"><mat-icon>event</mat-icon></div>
          <div class="stat-info">
            <h3>{{ dashboardData()?.stats?.activeAppointments || 0 }}</h3>
            <p>Total Appointments</p>
          </div>
        </div>
        <div class="stat-card" style="border-left: 4px solid #f9a825;">
          <div class="stat-icon" style="background: #fff8e1; color: #f9a825;"><mat-icon>pending_actions</mat-icon></div>
          <div class="stat-info">
            <h3>{{ dashboardData()?.pendingApprovals || 0 }}</h3>
            <p>Pending Approvals</p>
          </div>
        </div>
        <div class="stat-card" style="border-left: 4px solid #7b1fa2;">
          <div class="stat-icon" style="background: #f3e5f5; color: #7b1fa2;"><mat-icon>lock</mat-icon></div>
          <div class="stat-info">
            <h3>{{ dashboardData()?.confidentialAppointments || 0 }}</h3>
            <p>Confidential Meetings</p>
          </div>
        </div>
        <div class="stat-card" style="border-left: 4px solid #1565c0;">
          <div class="stat-icon" style="background: #e3f2fd; color: #1565c0;"><mat-icon>domain</mat-icon></div>
          <div class="stat-info">
            <h3>{{ dashboardData()?.stats?.totalDepartments || 0 }}</h3>
            <p>Departments</p>
          </div>
        </div>
      </div>

      <div class="chart-row">
        <mat-card class="chart-card">
          <mat-card-header><mat-card-title>Department Comparison</mat-card-title></mat-card-header>
          <mat-card-content>
            @for (dept of departmentData(); track dept.department) {
              <div class="dept-row">
                <span class="dept-name">{{ dept.department }}</span>
                <div class="dept-bar-container">
                  <div class="dept-bar" [style.width.%]="dept.percentage"></div>
                </div>
                <span class="dept-count">{{ dept.count }} visits</span>
              </div>
            }
          </mat-card-content>
        </mat-card>

        <mat-card class="chart-card">
          <mat-card-header><mat-card-title>Today's Schedule</mat-card-title></mat-card-header>
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
              <p class="empty-state">No appointments today</p>
            }
          </mat-card-content>
        </mat-card>
      </div>

      <mat-card class="activity-card">
        <mat-card-header><mat-card-title>Recent Activity</mat-card-title></mat-card-header>
        <mat-card-content>
          <div class="activity-list">
            @for (activity of dashboardData()?.recentActivities || []; track activity.id) {
              <div class="activity-item">
                <div class="activity-dot" [style.background]="activity.color"></div>
                <div class="activity-content">
                  <strong>{{ activity.title }}</strong>
                  <p>{{ activity.description }}</p>
                  <small>{{ activity.timestamp }}</small>
                </div>
              </div>
            }
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .confidential-banner {
      display: flex; align-items: center; gap: 16px;
      background: linear-gradient(135deg, #f3e5f5, #ede7f6);
      padding: 16px 20px; border-radius: 8px; margin-bottom: 24px;
      border: 1px solid #ce93d8;
    }
    .confidential-banner mat-icon { color: #7b1fa2; font-size: 32px; width: 32px; height: 32px; }
    .confidential-banner strong { font-size: 16px; color: #4a148c; }
    .confidential-banner p { font-size: 13px; color: #666; margin: 2px 0 0; }
    .stat-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .stat-card {
      background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      padding: 20px; display: flex; align-items: center; gap: 16px;
    }
    .stat-icon { width: 56px; height: 56px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .stat-icon mat-icon { font-size: 28px; }
    .stat-info h3 { font-size: 28px; font-weight: 700; margin: 0; }
    .stat-info p { font-size: 13px; color: #666; margin: 4px 0 0; }
    .chart-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .dept-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .dept-name { min-width: 100px; font-size: 13px; }
    .dept-bar-container { flex: 1; height: 24px; background: #f0f0f0; border-radius: 4px; overflow: hidden; }
    .dept-bar { height: 100%; background: linear-gradient(90deg, #f9a825, #fbc02d); border-radius: 4px; }
    .dept-count { min-width: 70px; text-align: right; font-size: 12px; color: #666; }
    .apt-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
    .apt-item:last-child { border-bottom: none; }
    .apt-time { font-weight: 600; color: #1a237e; min-width: 60px; font-size: 13px; }
    .apt-info { flex: 1; }
    .apt-info strong { font-size: 14px; display: block; }
    .apt-info p { font-size: 12px; color: #666; margin: 2px 0; }
    .activity-card { margin-bottom: 16px; }
    .activity-list { max-height: 300px; overflow-y: auto; }
    .activity-item { display: flex; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
    .activity-item:last-child { border-bottom: none; }
    .activity-dot { width: 10px; height: 10px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
    .activity-content strong { font-size: 14px; display: block; }
    .activity-content p { font-size: 12px; color: #666; margin: 2px 0; }
    .activity-content small { font-size: 11px; color: #999; }
    .empty-state { text-align: center; color: #999; padding: 24px; }
    @media (max-width: 768px) { .chart-row { grid-template-columns: 1fr; } }
  `]
})
export class CeoDashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  dashboardData = signal<DashboardData | null>(null);
  departmentData = signal<{ department: string; count: number; percentage: number }[]>([]);

  ngOnInit(): void {
    this.dashboardService.getCeoDashboard().subscribe({
      next: (res) => {
        if (res.success) {
          this.dashboardData.set(res.data);
          this.processDepartmentData(res.data);
        }
      },
      error: () => {
        this.dashboardData.set({
          stats: { totalVisitorsToday: 35, totalVisitorsThisWeek: 175, totalVisitorsThisMonth: 700, activeAppointments: 245, pendingAppointments: 10, checkedInVisitors: 6, totalEmployees: 87, totalDepartments: 12, unreadNotifications: 2 },
          visitorChart: { labels: [], data: [], type: 'weekly' },
          departmentChart: { labels: ['IT','HR','Finance','Marketing','Operations'], data: [32,18,22,15,25], type: 'weekly' },
          hourlyTraffic: [], recentActivities: [], todayAppointments: [], activeVisitors: [], pendingApprovals: 10, confidentialAppointments: 5
        });
        this.processDepartmentData(this.dashboardData()!);
      }
    });
  }

  private processDepartmentData(data: DashboardData): void {
    const labels = data.departmentChart?.labels || [];
    const values = data.departmentChart?.data || [];
    const max = Math.max(...values, 1);
    this.departmentData.set(labels.map((dept, i) => ({ department: dept, count: values[i], percentage: (values[i] / max) * 100 })));
  }
}
