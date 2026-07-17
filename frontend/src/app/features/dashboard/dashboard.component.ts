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
  styles: [`
    .dashboard { }
    .page-header { margin-bottom: 1.5rem; }
    .page-title { font-size: 1.5rem; font-weight: 700; color: #1e293b; margin: 0; }
    .page-subtitle { color: #64748b; font-size: 0.875rem; margin: 0.25rem 0 0; }
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
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }
    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      flex-shrink: 0;
    }
    .stat-icon-blue { background: #dbeafe; }
    .stat-icon-green { background: #dcfce7; }
    .stat-icon-purple { background: #f3e8ff; }
    .stat-icon-orange { background: #fed7aa; }
    .stat-info { display: flex; flex-direction: column; }
    .stat-value { font-size: 1.75rem; font-weight: 700; color: #1e293b; line-height: 1.2; }
    .stat-label { font-size: 0.8125rem; color: #64748b; }
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
      gap: 1rem;
    }
    .card {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      overflow: hidden;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid #f1f5f9;
    }
    .card-header h3 { margin: 0; font-size: 1rem; font-weight: 600; color: #1e293b; }
    .card-link { color: #3b82f6; text-decoration: none; font-size: 0.8125rem; }
    .card-link:hover { text-decoration: underline; }
    .card-body { padding: 0.5rem 0; }
    .list-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.625rem 1.25rem;
    }
    .list-item:hover { background: #f8fafc; }
    .list-item-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #3b82f6;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
      flex-shrink: 0;
    }
    .avatar-green { background: #10b981; }
    .avatar-gray { background: #94a3b8; }
    .list-item-info { flex: 1; min-width: 0; }
    .list-item-title { display: block; font-size: 0.875rem; font-weight: 500; color: #1e293b; }
    .list-item-subtitle { display: block; font-size: 0.75rem; color: #94a3b8; }
    .list-item-time { font-size: 0.75rem; color: #94a3b8; white-space: nowrap; }
    .empty-text { text-align: center; color: #94a3b8; padding: 1rem; margin: 0; font-size: 0.875rem; }
  `],
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
