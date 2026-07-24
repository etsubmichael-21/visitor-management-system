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
  styleUrls: ['./employee-detail.component.scss']
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
