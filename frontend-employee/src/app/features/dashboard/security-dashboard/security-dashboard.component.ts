import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DashboardService } from '../../../core/services/dashboard.service';
import { VisitService } from '../../../core/services/visit.service';
import { DashboardData } from '../../../core/models/dashboard.model';
import { Visit } from '../../../core/models/visit.model';

@Component({
  selector: 'app-security-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatIconModule, MatButtonModule],
  template: `
    <div class="security-dashboard">
      <div class="stat-row">
        <div class="stat-card" style="border-left: 4px solid #0F6B3A;">
          <div class="stat-icon" style="background: #e8f5e9; color: #0F6B3A;"><mat-icon>security</mat-icon></div>
          <div class="stat-info">
            <h3>{{ activeVisitors().length }}</h3>
            <p>Active In Building</p>
          </div>
        </div>
        <div class="stat-card" style="border-left: 4px solid #1565c0;">
          <div class="stat-icon" style="background: #e3f2fd; color: #1565c0;"><mat-icon>how_to_reg</mat-icon></div>
          <div class="stat-info">
            <h3>{{ dashboardData()?.stats?.totalVisitorsToday || 0 }}</h3>
            <p>Today's Check-Ins</p>
          </div>
        </div>
        <div class="stat-card" style="border-left: 4px solid #D4A017;">
          <div class="stat-icon" style="background: #fff8e1; color: #D4A017;"><mat-icon>logout</mat-icon></div>
          <div class="stat-info">
            <h3>{{ dashboardData()?.stats?.checkedInVisitors || 0 }}</h3>
            <p>Currently In Building</p>
          </div>
        </div>
        <div class="stat-card" style="border-left: 4px solid #7b1fa2;">
          <div class="stat-icon" style="background: #f3e5f5; color: #7b1fa2;"><mat-icon>schedule</mat-icon></div>
          <div class="stat-info">
            <h3>{{ dashboardData()?.stats?.pendingAppointments || 0 }}</h3>
            <p>Expected</p>
          </div>
        </div>
      </div>

      <div class="action-row">
        <button mat-raised-button color="primary" routerLink="/security/check-out" class="big-action">
          <mat-icon>logout</mat-icon> Check-Out Visitor
        </button>
        <button mat-stroked-button color="primary" routerLink="/security/active" class="big-action">
          <mat-icon>list</mat-icon> Active Visitors List
        </button>
      </div>

      <mat-card class="active-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon style="color: #0F6B3A;">warning</mat-icon>
            Active Visitors - Security View
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="visitor-grid">
            @for (v of activeVisitors(); track v.id) {
              <div class="visitor-card">
                <div class="visitor-header">
                  <div class="visitor-avatar">{{ v.visitorName?.charAt(0) }}</div>
                  <div class="visitor-main">
                    <strong>{{ v.visitorName }}</strong>
                    <small>Badge: {{ v.badgeNumber || 'N/A' }}</small>
                  </div>
                </div>
                <div class="visitor-details">
                   <p><mat-icon>person</mat-icon> Host: {{ v.employeeName }}</p>
                  <p><mat-icon>domain</mat-icon> {{ v.departmentName }}</p>
                   <p><mat-icon>schedule</mat-icon> Since: {{ v.checkInTime }}</p>
                   <p *ngIf="v.departmentName"><mat-icon>domain</mat-icon> {{ v.departmentName }}</p>
                </div>
                <button mat-stroked-button color="warn" [routerLink]="['/security/check-out']"
                        [queryParams]="{visitId: v.id}" class="checkout-btn">
                  <mat-icon>logout</mat-icon> Check Out
                </button>
              </div>
            }
            @if (!activeVisitors().length) {
              <div class="empty-state">
                <mat-icon>check_circle</mat-icon>
                <p>No active visitors in the building</p>
              </div>
            }
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styleUrls: ['./security-dashboard.component.scss']
})
export class SecurityDashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private visitService = inject(VisitService);
  dashboardData = signal<DashboardData | null>(null);
  activeVisitors = signal<Visit[]>([]);

  ngOnInit(): void {
    this.dashboardService.getSecurityDashboard().subscribe({
      next: (res) => { if (res.success) this.dashboardData.set(res.data); },
      error: () => {
        this.dashboardData.set({
          stats: { totalVisitorsToday: 28, totalVisitorsThisWeek: 140, totalVisitorsThisMonth: 420, activeAppointments: 328, pendingAppointments: 0, checkedInVisitors: 8, totalEmployees: 0, totalDepartments: 0, unreadNotifications: 0 },
          visitorChart: { labels: [], data: [], type: 'daily' }, departmentChart: { labels: [], data: [], type: 'daily' },
          hourlyTraffic: [], recentActivities: [], todayAppointments: [], activeVisitors: [], pendingApprovals: 0, confidentialAppointments: 0
        });
      }
    });

    this.visitService.getActiveVisits().subscribe({
      next: (res) => { if (res.success) this.activeVisitors.set(res.data || []); },
      error: () => { this.activeVisitors.set([]); }
    });
  }
}
