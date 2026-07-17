import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';
import { PagedResponse } from '../../../core/models/paged-response.model';
import { DataTableComponent, ColumnConfig } from '../../../shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [RouterLink, NgIf, DataTableComponent, PageHeaderComponent],
  template: `
    <app-page-header title="Users" subtitle="Manage system user accounts">
      <a routerLink="/users/new" class="btn btn-primary">+ Add User</a>
    </app-page-header>

    <app-data-table
      [data]="userData"
      [columns]="columns"
      [pageNumber]="pageNumber"
      [pageSize]="pageSize"
      [sortBy]="sortBy"
      [sortDirection]="sortDirection"
      (pageChange)="onPageChange($event)"
      (pageSizeChange)="onPageSizeChange($event)"
      (sort)="onSort($event)"
      (searchChange)="onSearch($event)"
      searchPlaceholder="Search by name or email..."
      emptyMessage="No users found"
    >
      <ng-template #actions let-item>
        <div class="action-btns">
          <a [routerLink]="['/users', item.id]" class="btn-icon" title="View">👁</a>
          <a [routerLink]="['/users', item.id, 'edit']" class="btn-icon" title="Edit">✏</a>
          <button *ngIf="item.isActive" class="btn-icon btn-icon-warning" (click)="toggleActive(item, false)" title="Deactivate">🔴</button>
          <button *ngIf="!item.isActive" class="btn-icon btn-icon-green" (click)="toggleActive(item, true)" title="Activate">🟢</button>
        </div>
      </ng-template>
    </app-data-table>
  `,
  styles: [`
    .btn { padding: 0.5rem 1rem; border: none; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 0.375rem; transition: background 0.2s; }
    .btn-primary { background: #3b82f6; color: #fff; }
    .btn-primary:hover { background: #2563eb; }
    .action-btns { display: flex; gap: 0.375rem; justify-content: flex-end; }
    .btn-icon { background: none; border: 1px solid #e2e8f0; border-radius: 6px; padding: 0.25rem 0.5rem; cursor: pointer; font-size: 0.875rem; text-decoration: none; transition: background 0.15s; }
    .btn-icon:hover { background: #f1f5f9; }
    .btn-icon-green:hover { background: #dcfce7; border-color: #86efac; }
    .btn-icon-warning:hover { background: #fee2e2; border-color: #fca5a5; }
  `],
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  private notification = inject(NotificationService);

  userData: PagedResponse<User> | null = null;
  pageNumber = 1;
  pageSize = 10;
  sortBy = 'fullName';
  sortDirection: 'asc' | 'desc' = 'asc';
  searchTerm = '';

  columns: ColumnConfig[] = [
    { key: 'fullName', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'lastLogin', label: 'Last Login', pipe: 'date' },
  ];

  ngOnInit(): void { this.loadUsers(); }

  private loadUsers(): void {
    this.userService.getAll({
      page: this.pageNumber,
      pageSize: this.pageSize,
      sortBy: this.sortBy,
      sortDirection: this.sortDirection,
      searchTerm: this.searchTerm,
    }).subscribe((data) => (this.userData = data));
  }

  onPageChange(page: number): void { this.pageNumber = page; this.loadUsers(); }
  onPageSizeChange(size: number): void { this.pageSize = size; this.pageNumber = 1; this.loadUsers(); }
  onSort(sort: { sortBy: string; sortDirection: 'asc' | 'desc' }): void { this.sortBy = sort.sortBy; this.sortDirection = sort.sortDirection; this.loadUsers(); }
  onSearch(term: string): void { this.searchTerm = term; this.pageNumber = 1; this.loadUsers(); }

  toggleActive(user: User, active: boolean): void {
    const request = active ? this.userService.activate(user.id) : this.userService.deactivate(user.id);
    request.subscribe(() => {
      this.notification.showSuccess(`User ${active ? 'activated' : 'deactivated'}`);
      this.loadUsers();
    });
  }
}
