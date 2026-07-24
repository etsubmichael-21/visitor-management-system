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
        <div class="stat-card" style="border-left: 4px solid #0F6B3A;">
          <div class="stat-icon" style="background: #e8f5e9; color: #0F6B3A;">
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
        <div class="stat-card" style="border-left: 4px solid #D4A017;">
          <div class="stat-icon" style="background: #fff8e1; color: #D4A017;">
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
  styleUrls: ['./admin-dashboard.component.scss']
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
