import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EmployeeService } from '../../../core/services/employee.service';
import { Employee } from '../../../core/models/employee.model';
import { PagedResponse } from '../../../core/models/paged-response.model';
import { DataTableComponent, ColumnConfig } from '../../../shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Dialog } from '@angular/cdk/dialog';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [RouterLink, DataTableComponent, PageHeaderComponent],
  template: `
    <app-page-header title="Employees" subtitle="Manage organization employees">
      <a routerLink="/employees/new" class="btn btn-primary">+ Add Employee</a>
    </app-page-header>

    <app-data-table
      [data]="employeeData"
      [columns]="columns"
      [pageNumber]="pageNumber"
      [pageSize]="pageSize"
      [sortBy]="sortBy"
      [sortDirection]="sortDirection"
      (pageChange)="onPageChange($event)"
      (pageSizeChange)="onPageSizeChange($event)"
      (sort)="onSort($event)"
      (searchChange)="onSearch($event)"
      searchPlaceholder="Search by name, email, or position..."
      emptyMessage="No employees found"
    >
      <ng-template #actions let-item>
        <div class="action-btns">
          <a [routerLink]="['/employees', item.id]" class="btn-icon" title="View">👁</a>
          <a [routerLink]="['/employees', item.id, 'edit']" class="btn-icon" title="Edit">✏</a>
          <button class="btn-icon btn-icon-danger" (click)="confirmDelete(item)" title="Delete">🗑</button>
        </div>
      </ng-template>
    </app-data-table>
  `,
  styleUrls: ['./employee-list.component.scss'],
})
export class EmployeeListComponent implements OnInit {
  private employeeService = inject(EmployeeService);
  private dialog = inject(Dialog);
  private notification = inject(NotificationService);

  employeeData: PagedResponse<Employee> | null = null;
  pageNumber = 1;
  pageSize = 10;
  sortBy = 'fullName';
  sortDirection: 'asc' | 'desc' = 'asc';
  searchTerm = '';

  columns: ColumnConfig[] = [
    { key: 'fullName', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'departmentName', label: 'Department' },
    { key: 'position', label: 'Position' },
    { key: 'phone', label: 'Phone' },
    { key: 'status', label: 'Status', sortable: true },
  ];

  ngOnInit(): void { this.loadEmployees(); }

  private loadEmployees(): void {
    this.employeeService.getAll({
      page: this.pageNumber,
      pageSize: this.pageSize,
      sortBy: this.sortBy,
      sortDirection: this.sortDirection,
      searchTerm: this.searchTerm,
    }).subscribe((data) => (this.employeeData = data));
  }

  onPageChange(page: number): void { this.pageNumber = page; this.loadEmployees(); }
  onPageSizeChange(size: number): void { this.pageSize = size; this.pageNumber = 1; this.loadEmployees(); }
  onSort(sort: { sortBy: string; sortDirection: 'asc' | 'desc' }): void { this.sortBy = sort.sortBy; this.sortDirection = sort.sortDirection; this.loadEmployees(); }
  onSearch(term: string): void { this.searchTerm = term; this.pageNumber = 1; this.loadEmployees(); }

  confirmDelete(employee: Employee): void {
    const dialogRef = this.dialog.open<boolean>(ConfirmDialogComponent, {
      data: {
        title: 'Delete Employee',
        message: `Are you sure you want to delete "${employee.fullName}"? This may affect visit records.`,
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
        type: 'danger',
      } as ConfirmDialogData,
    });
    dialogRef.closed.subscribe((result) => {
      if (result) {
        this.employeeService.delete(employee.id).subscribe(() => {
          this.notification.showSuccess('Employee deleted');
          this.loadEmployees();
        });
      }
    });
  }
}
