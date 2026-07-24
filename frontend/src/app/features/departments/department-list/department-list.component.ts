import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DepartmentService } from '../../../core/services/department.service';
import { Department } from '../../../core/models/department.model';
import { PagedResponse } from '../../../core/models/paged-response.model';
import { DataTableComponent, ColumnConfig } from '../../../shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Dialog } from '@angular/cdk/dialog';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [RouterLink, DataTableComponent, PageHeaderComponent],
  template: `
    <app-page-header title="Departments" subtitle="Manage organization departments">
      <a routerLink="/departments/new" class="btn btn-primary">+ Add Department</a>
    </app-page-header>

    <app-data-table
      [data]="deptData"
      [columns]="columns"
      [pageNumber]="pageNumber"
      [pageSize]="pageSize"
      [sortBy]="sortBy"
      [sortDirection]="sortDirection"
      (pageChange)="onPageChange($event)"
      (pageSizeChange)="onPageSizeChange($event)"
      (sort)="onSort($event)"
      (searchChange)="onSearch($event)"
      searchPlaceholder="Search departments..."
      emptyMessage="No departments found"
    >
      <ng-template #actions let-item>
        <div class="action-btns">
          <a [routerLink]="['/departments', item.id, 'edit']" class="btn-icon" title="Edit">✏</a>
          <button class="btn-icon btn-icon-danger" (click)="confirmDelete(item)" title="Delete">🗑</button>
        </div>
      </ng-template>
    </app-data-table>
  `,
  styleUrls: ['./department-list.component.scss'],
})
export class DepartmentListComponent implements OnInit {
  private departmentService = inject(DepartmentService);
  private dialog = inject(Dialog);
  private notification = inject(NotificationService);

  deptData: PagedResponse<Department> | null = null;
  pageNumber = 1;
  pageSize = 10;
  sortBy = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';
  searchTerm = '';

  columns: ColumnConfig[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'description', label: 'Description' },
    { key: 'location', label: 'Location' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
  ];

  ngOnInit(): void { this.loadDepartments(); }

  private loadDepartments(): void {
    this.departmentService.getAll({
      page: this.pageNumber,
      pageSize: this.pageSize,
      sortBy: this.sortBy,
      sortDirection: this.sortDirection,
      searchTerm: this.searchTerm,
    }).subscribe((data) => (this.deptData = data));
  }

  onPageChange(page: number): void { this.pageNumber = page; this.loadDepartments(); }
  onPageSizeChange(size: number): void { this.pageSize = size; this.pageNumber = 1; this.loadDepartments(); }
  onSort(sort: { sortBy: string; sortDirection: 'asc' | 'desc' }): void { this.sortBy = sort.sortBy; this.sortDirection = sort.sortDirection; this.loadDepartments(); }
  onSearch(term: string): void { this.searchTerm = term; this.pageNumber = 1; this.loadDepartments(); }

  confirmDelete(dept: Department): void {
    const dialogRef = this.dialog.open<boolean>(ConfirmDialogComponent, {
      data: {
        title: 'Delete Department',
        message: `Are you sure you want to delete "${dept.name}"? Employees in this department will be affected.`,
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
        type: 'danger',
      } as ConfirmDialogData,
    });
    dialogRef.closed.subscribe((result) => {
      if (result) {
        this.departmentService.delete(dept.id).subscribe(() => {
          this.notification.showSuccess('Department deleted');
          this.loadDepartments();
        });
      }
    });
  }
}
