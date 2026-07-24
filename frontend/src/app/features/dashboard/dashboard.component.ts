import { Component, OnInit, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardStats } from '../../core/models/dashboard.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgIf, LoadingSpinnerComponent],
  template: `
    <div class="dashboard">
      <div class="page-header">
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">Overview of visitor management activity</p>
      </div>

      <app-loading-spinner [loading]="loading" />

      <ng-container *ngIf="!loading && stats">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon stat-icon-blue">👥</div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.totalVisitorsToday }}</span>
              <span class="stat-label">Visitors Today</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon stat-icon-green">✅</div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.checkedInVisitors }}</span>
              <span class="stat-label">Checked In</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon stat-icon-purple">📅</div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.activeAppointments }}</span>
              <span class="stat-label">Active Appointments</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon stat-icon-orange">⏳</div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.pendingAppointments }}</span>
              <span class="stat-label">Pending Appointments</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon stat-icon-blue">📆</div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.totalVisitorsThisWeek }}</span>
              <span class="stat-label">Visitors This Week</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon stat-icon-green">📊</div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.totalVisitorsThisMonth }}</span>
              <span class="stat-label">Visitors This Month</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon stat-icon-purple">👤</div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.totalEmployees }}</span>
              <span class="stat-label">Total Employees</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon stat-icon-orange">🏢</div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.totalDepartments }}</span>
              <span class="stat-label">Departments</span>
            </div>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  loading = true;
  stats: DashboardStats | null = null;

  ngOnInit(): void {
    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }
}
