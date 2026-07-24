import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { ReportService } from '../../core/services/report.service';
import { DepartmentService } from '../../core/services/department.service';
import { ReportData, Department } from '../../core/models/common.model';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatDatepickerModule, MatNativeDateModule, MatTabsModule
  ],
  template: `
    <div class="reports-page">
      <div class="page-header">
        <h1>Reports</h1>
      </div>

      <mat-card class="filter-card">
        <div class="filters">
          <mat-form-field appearance="outline">
            <mat-label>Report Type</mat-label>
            <mat-select [(ngModel)]="reportType">
              <mat-option value="visitors">Visitor Report</mat-option>
              <mat-option value="appointments">Appointment Report</mat-option>
              <mat-option value="departments">Department Report</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Date From</mat-label>
            <input matInput [matDatepicker]="fromPicker" [(ngModel)]="dateFrom">
            <mat-datepicker-toggle matSuffix [for]="fromPicker"></mat-datepicker-toggle>
            <mat-datepicker #fromPicker></mat-datepicker>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Date To</mat-label>
            <input matInput [matDatepicker]="toPicker" [(ngModel)]="dateTo">
            <mat-datepicker-toggle matSuffix [for]="toPicker"></mat-datepicker-toggle>
            <mat-datepicker #toPicker></mat-datepicker>
          </mat-form-field>
          @if (reportType !== 'departments') {
            <mat-form-field appearance="outline">
              <mat-label>Department</mat-label>
              <mat-select [(ngModel)]="departmentId">
                <mat-option value="">All Departments</mat-option>
                @for (dept of departments(); track dept.id) {
                  <mat-option [value]="dept.id">{{ dept.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          }
          <button mat-raised-button color="primary" (click)="generateReport()" class="generate-btn">
            <mat-icon>assessment</mat-icon> Generate
          </button>
        </div>
      </mat-card>

      @if (reportData()) {
        <div class="report-results">
          <mat-card>
            <mat-card-header>
              <mat-card-title>{{ reportData()!.title }}</mat-card-title>
              <mat-card-subtitle>Generated: {{ reportData()!.generatedAt }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="summary-cards">
                @for (entry of summaryEntries(); track entry.key) {
                  <div class="summary-card">
                    <h3>{{ entry.value }}</h3>
                    <p>{{ entry.key }}</p>
                  </div>
                }
              </div>

              <div class="chart-section">
                <h3>Chart Data</h3>
                <div class="bar-chart">
                  @for (label of reportData()!.charts.labels; track label; let i = $index) {
                    <div class="bar-item">
                      <div class="bar-value">{{ reportData()!.charts.datasets[0]?.data[i] || 0 }}</div>
                      <div class="bar" [style.height.px]="getBarHeight(reportData()!.charts.datasets[0]?.data[i] || 0)"></div>
                      <span class="bar-label">{{ label }}</span>
                    </div>
                  }
                </div>
              </div>

              <div class="table-section">
                <h3>Details</h3>
                @if (reportData()!.details?.length) {
                  <table class="report-table">
                    <thead>
                      <tr>
                        @for (key of tableKeys(); track key) {
                          <th>{{ key }}</th>
                        }
                      </tr>
                    </thead>
                    <tbody>
                      @for (row of reportData()!.details; track $index) {
                        <tr>
                          @for (key of tableKeys(); track key) {
                            <td>{{ row[key] || 'N/A' }}</td>
                          }
                        </tr>
                      }
                    </tbody>
                  </table>
                } @else {
                  <p class="empty-state">No data for selected period</p>
                }
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      }
    </div>
  `,
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  private reportService = inject(ReportService);
  private departmentService = inject(DepartmentService);

  reportType = 'visitors';
  dateFrom = new Date(new Date().setDate(new Date().getDate() - 30));
  dateTo = new Date();
  departmentId = '';
  departments = signal<Department[]>([]);
  reportData = signal<ReportData | null>(null);
  summaryEntries = signal<{ key: string; value: number }[]>([]);
  tableKeys = signal<string[]>([]);
  maxBarValue = 1;

  ngOnInit(): void {
    this.departmentService.getAll().subscribe({
      next: (res) => { if (res.success) this.departments.set(res.data || []); }
    });
  }

  generateReport(): void {
    const filter = {
      reportType: this.reportType as any,
      dateFrom: this.dateFrom.toISOString().split('T')[0],
      dateTo: this.dateTo.toISOString().split('T')[0],
      departmentId: this.departmentId ? Number(this.departmentId) : undefined
    };
    this.reportService.generateReport(filter).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.reportData.set(res.data);
          this.summaryEntries.set(Object.entries(res.data.summary).map(([key, value]) => ({ key, value: value as number })));
          this.tableKeys.set(res.data.details?.length ? Object.keys(res.data.details[0]) : []);
          const allValues = res.data.charts.datasets.flatMap((ds: any) => ds.data);
          this.maxBarValue = Math.max(...allValues, 1);
        }
      }
    });
  }

  getBarHeight(value: number): number { return (value / this.maxBarValue) * 180; }
}
