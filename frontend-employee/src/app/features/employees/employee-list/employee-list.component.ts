import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { EmployeeService } from '../../../core/services/employee.service';
import { DepartmentService } from '../../../core/services/department.service';
import { Employee } from '../../../core/models/employee.model';
import { Department } from '../../../core/models/common.model';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatSelectModule, MatCardModule, MatChipsModule
  ],
  template: `
    <div class="employee-list">
      <div class="page-header">
        <h1>Employees</h1>
        <a mat-raised-button color="primary" routerLink="/admin/employees/new">
          <mat-icon>person_add</mat-icon> Add Employee
        </a>
      </div>

      <mat-card class="filter-card">
        <div class="filters">
          <mat-form-field appearance="outline">
            <mat-label>Search</mat-label>
            <input matInput [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" placeholder="Search employees...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Department</mat-label>
            <mat-select [(ngModel)]="selectedDepartment" (ngModelChange)="loadEmployees()">
              <mat-option value="">All Departments</mat-option>
              @for (dept of departments(); track dept.id) {
                <mat-option [value]="dept.id">{{ dept.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="selectedStatus" (ngModelChange)="loadEmployees()">
              <mat-option value="">All</mat-option>
              <mat-option [value]="true">Active</mat-option>
              <mat-option [value]="false">Inactive</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card>

      <mat-card>
        <div class="table-container">
          <table mat-table [dataSource]="employees()" matSort (matSortChange)="onSort($event)">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
              <td mat-cell *matCellDef="let emp">
                <div class="name-cell">
                  <div class="avatar">{{ emp.fullName?.charAt(0) || '?' }}</div>
                  <div>
                    <strong>{{ emp.fullName }}</strong>
                    <small>{{ emp.email }}</small>
                  </div>
                </div>
              </td>
            </ng-container>
            <ng-container matColumnDef="department">
              <th mat-header-cell *matHeaderCellDef>Department</th>
              <td mat-cell *matCellDef="let emp">{{ emp.departmentName || 'N/A' }}</td>
            </ng-container>
            <ng-container matColumnDef="position">
              <th mat-header-cell *matHeaderCellDef>Position</th>
              <td mat-cell *matCellDef="let emp">{{ emp.position }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let emp">
                <span class="ecx-status-badge" [ngClass]="emp.status === 'Active' ? 'active' : 'inactive'">
                  {{ emp.status }}
                </span>
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let emp">
                <button mat-icon-button [routerLink]="['/admin/employees', emp.id]" matTooltip="View">
                  <mat-icon>visibility</mat-icon>
                </button>
                <button mat-icon-button [routerLink]="['/admin/employees', emp.id, 'edit']" matTooltip="Edit">
                  <mat-icon>edit</mat-icon>
                </button>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" (click)="viewEmployee(row)" class="clickable-row"></tr>
          </table>
        </div>
        <mat-paginator [length]="totalCount()" [pageSize]="pageSize()" [pageSizeOptions]="[10, 25, 50]"
                       (page)="onPageChange($event)" showFirstLastButtons>
        </mat-paginator>
      </mat-card>
    </div>
  `,
  styleUrls: ['./employee-list.component.scss']
})
export class EmployeeListComponent implements OnInit {
  private employeeService = inject(EmployeeService);
  private departmentService = inject(DepartmentService);

  displayedColumns = ['name', 'department', 'position', 'status', 'actions'];
  employees = signal<Employee[]>([]);
  departments = signal<Department[]>([]);
  totalCount = signal(0);
  pageSize = signal(10);
  currentPage = signal(0);
  searchTerm = '';
  selectedDepartment = '';
  selectedStatus: boolean | '' = '';
  sortField = 'fullName';
  sortDirection: 'asc' | 'desc' = 'asc';
  private searchTimeout: any;

  ngOnInit(): void {
    this.departmentService.getAll().subscribe({
      next: (res) => { if (res.success) this.departments.set(res.data || []); }
    });
    this.loadEmployees();
  }

  loadEmployees(): void {
    const filter: any = {
      page: (this.currentPage() + 1).toString(),
      limit: this.pageSize().toString(),
      sortBy: this.sortField,
      sortOrder: this.sortDirection
    };
    if (this.searchTerm) filter.search = this.searchTerm;
    if (this.selectedDepartment) filter.departmentId = this.selectedDepartment.toString();
    if (this.selectedStatus !== '') filter.isActive = this.selectedStatus.toString();

    this.employeeService.getAll(filter).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.employees.set(res.data.items || []);
          this.totalCount.set(res.data.totalCount || 0);
        }
      }
    });
  }

  onSearch(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(0);
      this.loadEmployees();
    }, 300);
  }

  onPageChange(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    this.currentPage.set(event.pageIndex);
    this.loadEmployees();
  }

  onSort(event: Sort): void {
    this.sortField = event.active || 'fullName';
    this.sortDirection = (event.direction as 'asc' | 'desc') || 'asc';
    this.loadEmployees();
  }

  viewEmployee(emp: Employee): void {
  }
}
