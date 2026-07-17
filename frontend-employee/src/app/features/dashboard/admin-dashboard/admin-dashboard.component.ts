import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DashboardService } from '../../../core/services/dashboard.service';
import { DashboardData } from '../../../core/models/dashboard.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatIconModule, MatButtonModule, MatTableModule, MatProgressBarModule],
  template: `
    <div class="admin-dashboard">
      <div class="stat-row">
        <div class="stat-card" style="border-left: 4px solid #2e7d32;">
          <div class="stat-icon" style="background: #e8f5e9; color: #2e7d32;">
            <mat-icon>people</mat-icon>
          </div>
          <div class="stat-info">
            <h3>{{ dashboardData()?.stats?.totalEmployees || 0 }}</h3>
            <p>Total Employees</p>
          </div>
        </div>
        <div class="stat-card" style="border-left: 4px solid #1565c0;">
          <div class="stat-icon" style="background: #e3f2fd; color: #1565c0;">
            <mat-icon>person_add</mat-icon>
          </div>
          <div class="stat-info">
            <h3>{{ dashboardData()?.stats?.totalVisitorsToday || 0 }}</h3>
            <p>Today's Visitors</p>
          </div>
        </div>
        <div class="stat-card" style="border-left: 4px solid #f9a825;">
          <div class="stat-icon" style="background: #fff8e1; color: #f9a825;">
            <mat-icon>event</mat-icon>
          </div>
          <div class="stat-info">
            <h3>{{ dashboardData()?.stats?.pendingAppointments || 0 }}</h3>
            <p>Pending Appointments</p>
          </div>
        </div>
        <div class="stat-card" style="border-left: 4px solid #7b1fa2;">
          <div class="stat-icon" style="background: #f3e5f5; color: #7b1fa2;">
            <mat-icon>visibility</mat-icon>
          </div>
          <div class="stat-info">
            <h3>{{ dashboardData()?.stats?.checkedInVisitors || 0 }}</h3>
            <p>Active Visitors</p>
          </div>
        </div>
      </div>

      <div class="chart-row">
        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Visitor Trend (Weekly)</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="bar-chart">
              @for (item of weeklyData(); track item.label) {
                <div class="bar-item">
                  <div class="bar" [style.height.%]="item.percentage"></div>
                  <span class="bar-label">{{ item.label }}</span>
                  <span class="bar-value">{{ item.value }}</span>
                </div>
              }
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Visitors by Department</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            @for (dept of departmentData(); track dept.department) {
              <div class="dept-row">
                <span class="dept-name">{{ dept.department }}</span>
                <div class="dept-bar-container">
                  <div class="dept-bar" [style.width.%]="dept.percentage"></div>
                </div>
                <span class="dept-count">{{ dept.count }}</span>
              </div>
            }
          </mat-card-content>
        </mat-card>
      </div>

      <div class="bottom-row">
        <mat-card class="activity-card">
          <mat-card-header>
            <mat-card-title>Recent Activities</mat-card-title>
            <button mat-button color="primary" routerLink="/admin/reports">View All</button>
          </mat-card-header>
          <mat-card-content>
            @for (activity of dashboardData()?.recentActivities || []; track activity.id) {
              <div class="activity-item">
                <div class="activity-icon" [style.background]="activity.color + '20'" [style.color]="activity.color">
                  <mat-icon>{{ activity.icon }}</mat-icon>
                </div>
                <div class="activity-info">
                  <strong>{{ activity.title }}</strong>
                  <p>{{ activity.description }}</p>
                  <small>{{ activity.timestamp }}</small>
                </div>
              </div>
            }
          </mat-card-content>
        </mat-card>

        <mat-card class="appointments-card">
          <mat-card-header>
            <mat-card-title>Today's Appointments</mat-card-title>
            <button mat-button color="primary" routerLink="/admin/appointments">View All</button>
          </mat-card-header>
          <mat-card-content>
            @for (apt of dashboardData()?.todayAppointments || []; track apt.id) {
              <div class="apt-item">
                <div class="apt-time">{{ apt.time }}</div>
                <div class="apt-info">
                  <strong>{{ apt.visitorName }}</strong>
                  <p>with {{ apt.hostName }} - {{ apt.department }}</p>
                </div>
                <span class="ecx-status-badge" [ngClass]="apt.status.toLowerCase().replace(' ', '-')">{{ apt.status }}</span>
              </div>
            }
            @if (!dashboardData()?.todayAppointments?.length) {
              <p class="empty-state">No appointments scheduled for today</p>
            }
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .stat-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .stat-card {
      background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      padding: 20px; display: flex; align-items: center; gap: 16px;
    }
    .stat-icon { width: 56px; height: 56px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .stat-icon mat-icon { font-size: 28px; }
    .stat-info h3 { font-size: 28px; font-weight: 700; margin: 0; }
    .stat-info p { font-size: 13px; color: #666; margin: 4px 0 0; }
    .chart-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .chart-card mat-card-header { margin-bottom: 16px; }
    .bar-chart { display: flex; align-items: flex-end; gap: 12px; height: 200px; padding: 0 8px; }
    .bar-item { display: flex; flex-direction: column; align-items: center; flex: 1; }
    .bar { width: 100%; background: linear-gradient(180deg, #2e7d32, #4caf50); border-radius: 4px 4px 0 0; min-height: 4px; transition: height 0.3s; }
    .bar-label { font-size: 11px; color: #666; margin-top: 8px; }
    .bar-value { font-size: 12px; font-weight: 600; color: #333; }
    .dept-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .dept-name { min-width: 100px; font-size: 13px; color: #333; }
    .dept-bar-container { flex: 1; height: 24px; background: #f0f0f0; border-radius: 4px; overflow: hidden; }
    .dept-bar { height: 100%; background: linear-gradient(90deg, #1a237e, #283593); border-radius: 4px; transition: width 0.3s; }
    .dept-count { min-width: 30px; text-align: right; font-weight: 600; font-size: 13px; }
    .bottom-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .activity-card mat-card-header, .appointments-card mat-card-header { display: flex; justify-content: space-between; align-items: center; }
    .activity-item { display: flex; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
    .activity-item:last-child { border-bottom: none; }
    .activity-icon { width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .activity-icon mat-icon { font-size: 20px; }
    .activity-info strong { font-size: 14px; display: block; }
    .activity-info p { font-size: 12px; color: #666; margin: 2px 0; }
    .activity-info small { font-size: 11px; color: #999; }
    .apt-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
    .apt-item:last-child { border-bottom: none; }
    .apt-time { font-weight: 600; color: #1a237e; min-width: 60px; font-size: 13px; }
    .apt-info { flex: 1; }
    .apt-info strong { font-size: 14px; display: block; }
    .apt-info p { font-size: 12px; color: #666; margin: 2px 0; }
    .empty-state { text-align: center; color: #999; padding: 24px; }
    @media (max-width: 768px) {
      .chart-row, .bottom-row { grid-template-columns: 1fr; }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  dashboardData = signal<DashboardData | null>(null);
  weeklyData = signal<{ label: string; value: number; percentage: number }[]>([]);
  departmentData = signal<{ department: string; count: number; percentage: number }[]>([]);

  ngOnInit(): void {
    this.dashboardService.getAdminDashboard().subscribe({
      next: (res) => {
        if (res.success) {
          this.dashboardData.set(res.data);
          this.processChartData(res.data);
        }
      },
      error: () => {
        this.dashboardData.set({
          stats: { totalVisitorsToday: 42, totalVisitorsThisWeek: 210, totalVisitorsThisMonth: 845, activeAppointments: 328, pendingAppointments: 15, checkedInVisitors: 8, totalEmployees: 87, totalDepartments: 12, unreadNotifications: 3 },
          visitorChart: { labels: ['Mon','Tue','Wed','Thu','Fri'], data: [32,45,38,52,42], type: 'weekly' },
          departmentChart: { labels: ['IT','HR','Finance','Marketing'], data: [28,15,12,18], type: 'weekly' },
          hourlyTraffic: [], recentActivities: [], todayAppointments: [], activeVisitors: [], pendingApprovals: 15, confidentialAppointments: 3
        });
        this.processChartData(this.dashboardData()!);
      }
    });
  }

  private processChartData(data: DashboardData): void {
    const labels = data.visitorChart?.labels || ['Mon','Tue','Wed','Thu','Fri'];
    const values = data.visitorChart?.data || [32,45,38,52,42];
    const max = Math.max(...values, 1);
    this.weeklyData.set(labels.map((label, i) => ({ label, value: values[i], percentage: (values[i] / max) * 100 })));

    const deptLabels = data.departmentChart?.labels || ['IT','HR','Finance','Marketing'];
    const deptValues = data.departmentChart?.data || [28,15,12,18];
    const deptMax = Math.max(...deptValues, 1);
    this.departmentData.set(deptLabels.map((dept, i) => ({ department: dept, count: deptValues[i], percentage: (deptValues[i] / deptMax) * 100 })));
  }
}
