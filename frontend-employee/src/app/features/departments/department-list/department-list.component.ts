import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { DepartmentService } from '../../../core/services/department.service';
import { Department } from '../../../core/models/common.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatIconModule, MatButtonModule, MatTableModule],
  template: `
    <div class="department-list">
      <div class="page-header">
        <h1>Departments</h1>
        @if (isAdmin()) {
          <a mat-raised-button color="primary" routerLink="/admin/departments/new">
            <mat-icon>add</mat-icon> Add Department
          </a>
        }
      </div>

      <div class="dept-grid">
        @for (dept of departments(); track dept.id) {
          <mat-card class="dept-card">
            <mat-card-header>
              <div class="dept-icon"><mat-icon>domain</mat-icon></div>
              <mat-card-title>{{ dept.name }}</mat-card-title>
              <mat-card-subtitle>{{ dept.location || 'No location' }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p class="dept-desc">{{ dept.description || 'No description' }}</p>
              <div class="dept-meta">
                <span><mat-icon>people</mat-icon> {{ dept.employeeCount || 0 }} Employees</span>
                <span><mat-icon>location_on</mat-icon> {{ dept.location || 'N/A' }}</span>
              </div>
              @if (dept.phone || dept.email) {
                <div class="dept-contact">
                  @if (dept.phone) { <small>Phone: {{ dept.phone }}</small> }
                  @if (dept.email) { <small>Email: {{ dept.email }}</small> }
                </div>
              }
            </mat-card-content>
            <mat-card-actions>
              @if (isAdmin()) {
                <button mat-button color="primary" [routerLink]="['/admin/departments', dept.id, 'edit']">
                  <mat-icon>edit</mat-icon> Edit
                </button>
              }
            </mat-card-actions>
          </mat-card>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #2e7d32; }
    .page-header h1 { font-size: 24px; font-weight: 500; color: #1b5e20; }
    .page-header a { display: flex; align-items: center; gap: 8px; }
    .dept-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
    .dept-card { transition: transform 0.2s; }
    .dept-card:hover { transform: translateY(-2px); }
    .dept-icon { width: 48px; height: 48px; border-radius: 12px; background: #e8f5e9; display: flex; align-items: center; justify-content: center; margin-right: 12px; }
    .dept-icon mat-icon { color: #2e7d32; }
    .dept-desc { color: #666; font-size: 14px; margin: 8px 0; }
    .dept-meta { display: flex; gap: 16px; margin: 8px 0; }
    .dept-meta span { display: flex; align-items: center; gap: 4px; font-size: 13px; color: #555; }
    .dept-meta mat-icon { font-size: 16px; width: 16px; height: 16px; color: #999; }
    .dept-contact small { color: #1a237e; font-weight: 500; }
  `]
})
export class DepartmentListComponent implements OnInit {
  private departmentService = inject(DepartmentService);
  private authService = inject(AuthService);
  departments = signal<Department[]>([]);
  isAdmin = signal(false);

  ngOnInit(): void {
    this.isAdmin.set(this.authService.getUserRole() === 'Admin');
    this.departmentService.getAll().subscribe({
      next: (res) => { if (res.success) this.departments.set(res.data || []); }
    });
  }
}
