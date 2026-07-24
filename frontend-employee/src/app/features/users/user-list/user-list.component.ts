import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/auth.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule,
    MatTableModule, MatPaginatorModule, MatCardModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatSelectModule, MatSnackBarModule
  ],
  template: `
    <div class="user-list">
      <div class="page-header">
        <h1>Users</h1>
        <a mat-raised-button color="primary" routerLink="/admin/users/new">
          <mat-icon>person_add</mat-icon> Add User
        </a>
      </div>

      <mat-card class="filter-card">
        <div class="filters">
          <mat-form-field appearance="outline">
            <mat-label>Search</mat-label>
            <input matInput [(ngModel)]="searchTerm" (ngModelChange)="loadUsers()">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Role</mat-label>
            <mat-select [(ngModel)]="selectedRole" (ngModelChange)="loadUsers()">
              <mat-option value="">All Roles</mat-option>
              <mat-option value="Admin">Admin</mat-option>
              <mat-option value="CEO">CEO</mat-option>
              <mat-option value="DepartmentHead">Department Head</mat-option>
              <mat-option value="Employee">Employee</mat-option>
              <mat-option value="Receptionist">Receptionist</mat-option>
              <mat-option value="Security">Security</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card>

      <mat-card>
        <div class="table-container">
          <table mat-table [dataSource]="users()">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>User</th>
              <td mat-cell *matCellDef="let u">
                <div class="name-cell">
                  <div class="avatar">{{ u.fullName?.charAt(0) || '?' }}</div>
                  <div><strong>{{ u.fullName }}</strong><small>{{ u.email }}</small></div>
                </div>
              </td>
            </ng-container>
            <ng-container matColumnDef="role">
              <th mat-header-cell *matHeaderCellDef>Role</th>
              <td mat-cell *matCellDef="let u"><span class="role-chip">{{ u.role }}</span></td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let u">
                <span class="ecx-status-badge" [ngClass]="u.isActive ? 'active' : 'inactive'">{{ u.isActive ? 'Active' : 'Inactive' }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="lastLogin">
              <th mat-header-cell *matHeaderCellDef>Last Login</th>
              <td mat-cell *matCellDef="let u">{{ u.lastLogin || 'Never' }}</td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let u">
                <button mat-icon-button (click)="toggleActive(u)" matTooltip="Toggle Active">
                  <mat-icon>{{ u.isActive ? 'block' : 'check_circle' }}</mat-icon>
                </button>
                <button mat-icon-button (click)="resetPassword(u)" matTooltip="Reset Password">
                  <mat-icon>lock_reset</mat-icon>
                </button>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>
        <mat-paginator [length]="totalCount()" [pageSize]="pageSize()" [pageSizeOptions]="[10, 25, 50]"
                       (page)="onPageChange($event)" showFirstLastButtons>
        </mat-paginator>
      </mat-card>
    </div>
  `,
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);

  displayedColumns = ['name', 'role', 'status', 'lastLogin', 'actions'];
  users = signal<User[]>([]);
  totalCount = signal(0);
  pageSize = signal(10);
  currentPage = signal(0);
  searchTerm = '';
  selectedRole = '';

  ngOnInit(): void { this.loadUsers(); }

  loadUsers(): void {
    const filter: any = { page: (this.currentPage() + 1).toString(), limit: this.pageSize().toString() };
    if (this.searchTerm) filter.search = this.searchTerm;
    if (this.selectedRole) filter.role = this.selectedRole;
    this.userService.getAll(filter).subscribe({
      next: (res) => { if (res.success && res.data) { this.users.set(res.data.items || []); this.totalCount.set(res.data.totalCount || 0); } }
    });
  }

  onPageChange(event: PageEvent): void { this.pageSize.set(event.pageSize); this.currentPage.set(event.pageIndex); this.loadUsers(); }

  toggleActive(user: User): void {
    const call = user.isActive
      ? this.userService.deactivate(user.id)
      : this.userService.activate(user.id);
    call.subscribe({
      next: (res) => { if (res.success) { this.snackBar.open('User status updated', 'Close', { duration: 3000 }); this.loadUsers(); } }
    });
  }

  resetPassword(user: User): void {
    this.userService.resetPassword(user.id).subscribe({
      next: (res) => { if (res.success) this.snackBar.open('Password reset email sent', 'Close', { duration: 3000 }); }
    });
  }
}
