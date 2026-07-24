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
  styleUrls: ['./department-list.component.scss']
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
