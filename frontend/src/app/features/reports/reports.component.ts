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
  styleUrls: ['./reports.component.scss'],
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
