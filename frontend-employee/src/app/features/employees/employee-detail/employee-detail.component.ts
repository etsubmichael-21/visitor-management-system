import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { EmployeeService } from '../../../core/services/employee.service';
import { Employee } from '../../../core/models/employee.model';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatIconModule, MatButtonModule, MatTabsModule, MatDividerModule],
  template: `
    <div class="employee-detail">
      <div class="page-header">
        <h1>Employee Details</h1>
        <div class="header-actions">
          <a mat-stroked-button color="primary" [routerLink]="['/admin/employees', employee()?.id, 'edit']">
            <mat-icon>edit</mat-icon> Edit
          </a>
          <a mat-stroked-button color="primary" routerLink="/admin/employees">
            <mat-icon>arrow_back</mat-icon> Back
          </a>
        </div>
      </div>

      @if (employee()) {
        <div class="detail-grid">
          <mat-card class="profile-card">
            <mat-card-content>
              <div class="profile-header">
                <div class="avatar-large">{{ employee()!.fullName?.charAt(0) || '?' }}</div>
                <h2>{{ employee()!.fullName }}</h2>
                <span class="ecx-status-badge" [ngClass]="employee()!.status === 'Active' ? 'active' : 'inactive'">
                  {{ employee()!.status }}
                </span>
              </div>
              <mat-divider></mat-divider>
              <div class="info-list">
                <div class="info-item">
                  <mat-icon>email</mat-icon>
                  <div><small>Email</small><p>{{ employee()!.email }}</p></div>
                </div>
                <div class="info-item">
                  <mat-icon>phone</mat-icon>
                  <div><small>Phone</small><p>{{ employee()!.phone }}</p></div>
                </div>
                <div class="info-item">
                  <mat-icon>domain</mat-icon>
                  <div><small>Department</small><p>{{ employee()!.departmentName || 'N/A' }}</p></div>
                </div>
                <div class="info-item">
                  <mat-icon>work</mat-icon>
                  <div><small>Position</small><p>{{ employee()!.position }}</p></div>
                </div>
                <div class="info-item">
                  <mat-icon>meeting_room</mat-icon>
                  <div><small>Office Number</small><p>{{ employee()!.officeNumber || 'N/A' }}</p></div>
                </div>
                <div class="info-item">
                  <mat-icon>event</mat-icon>
                  <div><small>Pending Appointments</small><p>{{ employee()!.pendingAppointments }}</p></div>
                </div>
                <div class="info-item">
                  <mat-icon>event_available</mat-icon>
                  <div><small>Total Appointments</small><p>{{ employee()!.totalAppointments }}</p></div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="activity-card">
            <mat-card-header><mat-card-title>Recent Appointments</mat-card-title></mat-card-header>
            <mat-card-content>
              <p class="empty-hint">Appointment history will be shown here.</p>
            </mat-card-content>
          </mat-card>
        </div>
      } @else {
        <div class="loading-state">
          <p>Loading employee details...</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #2e7d32; }
    .page-header h1 { font-size: 24px; font-weight: 500; color: #1b5e20; }
    .header-actions { display: flex; gap: 8px; }
    .header-actions a { display: flex; align-items: center; gap: 4px; }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .profile-header { text-align: center; padding: 24px 0; }
    .avatar-large { width: 80px; height: 80px; border-radius: 50%; background: #1a237e; color: white; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 700; margin: 0 auto 12px; }
    .profile-header h2 { margin: 0; font-size: 22px; }
    .info-list { padding: 16px 0; }
    .info-item { display: flex; gap: 16px; padding: 12px 0; align-items: flex-start; }
    .info-item mat-icon { color: #1a2377; margin-top: 2px; }
    .info-item small { font-size: 11px; color: #999; display: block; }
    .info-item p { margin: 2px 0 0; font-size: 14px; }
    .empty-hint { text-align: center; color: #999; padding: 24px; }
    .loading-state { text-align: center; padding: 48px; color: #666; }
    @media (max-width: 768px) { .detail-grid { grid-template-columns: 1fr; } }
  `]
})
export class EmployeeDetailComponent implements OnInit {
  private employeeService = inject(EmployeeService);
  private route = inject(ActivatedRoute);
  employee = signal<Employee | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.employeeService.getById(Number(id)).subscribe({
        next: (res) => { if (res.success) this.employee.set(res.data); }
      });
    }
  }
}
