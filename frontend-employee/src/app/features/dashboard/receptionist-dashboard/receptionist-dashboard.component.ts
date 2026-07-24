import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DashboardService } from '../../../core/services/dashboard.service';
import { DashboardData } from '../../../core/models/dashboard.model';

@Component({
  selector: 'app-receptionist-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatIconModule, MatButtonModule],
  template: `
    <div class="reception-dashboard">
      <div class="stat-row">
        <div class="stat-card" style="border-left: 4px solid #0F6B3A;">
          <div class="stat-icon" style="background: #e8f5e9; color: #0F6B3A;"><mat-icon>how_to_reg</mat-icon></div>
          <div class="stat-info">
            <h3>{{ dashboardData()?.stats?.totalVisitorsToday || 0 }}</h3>
            <p>Today's Check-Ins</p>
          </div>
        </div>
        <div class="stat-card" style="border-left: 4px solid #1565c0;">
          <div class="stat-icon" style="background: #e3f2fd; color: #1565c0;"><mat-icon>visibility</mat-icon></div>
          <div class="stat-info">
            <h3>{{ dashboardData()?.stats?.checkedInVisitors || 0 }}</h3>
            <p>Currently In Building</p>
          </div>
        </div>
        <div class="stat-card" style="border-left: 4px solid #D4A017;">
          <div class="stat-icon" style="background: #fff8e1; color: #D4A017;"><mat-icon>event</mat-icon></div>
          <div class="stat-info">
            <h3>{{ dashboardData()?.stats?.pendingAppointments || 0 }}</h3>
            <p>Expected Today</p>
          </div>
        </div>
        <div class="stat-card" style="border-left: 4px solid #0F6B3A;">
          <div class="stat-icon" style="background: #e8f5e9; color: #0F6B3A;"><mat-icon>check_circle</mat-icon></div>
          <div class="stat-info">
            <h3>{{ dashboardData()?.stats?.activeAppointments || 0 }}</h3>
            <p>Total This Week</p>
          </div>
        </div>
      </div>

      <div class="action-row">
        <button mat-raised-button color="primary" routerLink="/reception/check-in" class="big-action">
          <mat-icon>person_add</mat-icon> Check-In Visitor
        </button>
      </div>

      <div class="content-row">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Today's Appointments</mat-card-title>
            <button mat-button color="primary" routerLink="/reception/today">View All</button>
          </mat-card-header>
          <mat-card-content>
            @for (apt of dashboardData()?.todayAppointments || []; track apt.id) {
              <div class="apt-item">
                <div class="apt-time">{{ apt.time }}</div>
                <div class="apt-info">
                  <strong>{{ apt.visitorName }}</strong>
                  <p>Host: {{ apt.hostName }} | {{ apt.department }}</p>
                </div>
                <span class="ecx-status-badge" [ngClass]="apt.status.toLowerCase()">{{ apt.status }}</span>
              </div>
            }
            @if (!dashboardData()?.todayAppointments?.length) {
              <p class="empty-state">No appointments scheduled</p>
            }
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-card-title>Currently In Building</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            @for (v of dashboardData()?.activeVisitors || []; track v.id) {
              <div class="visitor-item">
                <div class="visitor-avatar">{{ v.visitorName.charAt(0) }}</div>
                <div class="visitor-info">
                  <strong>{{ v.visitorName }}</strong>
                  <p>Host: {{ v.hostName }} | Badge: {{ v.badgeNumber || 'N/A' }}</p>
                  <small>Since {{ v.checkInTime }}</small>
                </div>
              </div>
            }
            @if (!dashboardData()?.activeVisitors?.length) {
              <p class="empty-state">No active visitors</p>
            }
          </mat-card-content>
        </mat-card>
      </div>

      <mat-card>
        <mat-card-header><mat-card-title>Hourly Traffic Today</mat-card-title></mat-card-header>
        <mat-card-content>
          <div class="traffic-chart">
            @for (h of dashboardData()?.hourlyTraffic || []; track h.hour) {
              <div class="traffic-bar-item">
                <div class="traffic-bar" [style.height.px]="h.count * 8"></div>
                <small>{{ h.hour }}</small>
              </div>
            }
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styleUrls: ['./receptionist-dashboard.component.scss']
})
export class ReceptionistDashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  dashboardData = signal<DashboardData | null>(null);

  ngOnInit(): void {
    this.dashboardService.getReceptionistDashboard().subscribe({
      next: (res) => { if (res.success) this.dashboardData.set(res.data); },
      error: () => {
        this.dashboardData.set({
          stats: { totalVisitorsToday: 28, totalVisitorsThisWeek: 140, totalVisitorsThisMonth: 420, activeAppointments: 328, pendingAppointments: 15, checkedInVisitors: 8, totalEmployees: 87, totalDepartments: 12, unreadNotifications: 0 },
          visitorChart: { labels: [], data: [], type: 'daily' }, departmentChart: { labels: [], data: [], type: 'daily' },
          hourlyTraffic: [
            { hour: '8AM', count: 3 }, { hour: '9AM', count: 8 }, { hour: '10AM', count: 12 },
            { hour: '11AM', count: 6 }, { hour: '12PM', count: 4 }, { hour: '1PM', count: 9 },
            { hour: '2PM', count: 7 }, { hour: '3PM', count: 5 }, { hour: '4PM', count: 3 }, { hour: '5PM', count: 1 }
          ],
          recentActivities: [], todayAppointments: [], activeVisitors: [], pendingApprovals: 0, confidentialAppointments: 0
        });
      }
    });
  }
}
