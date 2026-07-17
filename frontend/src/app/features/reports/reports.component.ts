import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { NotificationService } from '../../shared/services/notification.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [PageHeaderComponent, LoadingSpinnerComponent],
  template: `
    <app-page-header title="Reports" subtitle="Visitor management analytics">
      <button class="btn btn-outline" (click)="exportVisits()">Export Visits</button>
    </app-page-header>

    <div class="report-grid">
      <div class="card" (click)="loadReport('daily')">
        <div class="report-icon">📊</div>
        <h3>Daily Report</h3>
        <p>Visit summary for today</p>
      </div>
      <div class="card" (click)="loadReport('weekly')">
        <div class="report-icon">📈</div>
        <h3>Weekly Report</h3>
        <p>Weekly visit statistics</p>
      </div>
      <div class="card" (click)="loadReport('monthly')">
        <div class="report-icon">📉</div>
        <h3>Monthly Report</h3>
        <p>Monthly performance metrics</p>
      </div>
      <div class="card" (click)="loadReport('visitor')">
        <div class="report-icon">👥</div>
        <h3>Visitor Analytics</h3>
        <p>Visitor demographics and trends</p>
      </div>
    </div>

    <app-loading-spinner [loading]="loading" message="Loading report..." />
  `,
  styles: [`
    .btn { padding: 0.5rem 1rem; border: none; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; transition: background 0.2s; }
    .btn-outline { background: #fff; color: #475569; border: 1px solid #e2e8f0; }
    .btn-outline:hover { background: #f8fafc; }
    .report-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
    .card {
      background: #fff; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      cursor: pointer; transition: transform 0.15s, box-shadow 0.15s; text-align: center;
    }
    .card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.12); }
    .report-icon { font-size: 2rem; margin-bottom: 0.5rem; }
    .card h3 { margin: 0; font-size: 1rem; font-weight: 600; color: #1e293b; }
    .card p { margin: 0.25rem 0 0; color: #64748b; font-size: 0.8125rem; }
  `],
})
export class ReportsComponent {
  private http = inject(HttpClient);
  private notification = inject(NotificationService);
  loading = false;

  loadReport(type: string): void {
    this.loading = true;
    this.http.get(`${environment.apiUrl}/reports/${type}`).subscribe({
      next: () => {
        this.notification.showInfo(`${type} report loaded`);
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  exportVisits(): void {
    this.http.get(`${environment.apiUrl}/reports/export/visits`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'visits-export.csv';
        a.click();
        window.URL.revokeObjectURL(url);
        this.notification.showSuccess('Report exported');
      },
    });
  }
}
