import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { VisitorService } from '../../../core/services/visitor.service';
import { Visitor } from '../../../core/models/visitor.model';
import { PagedResponse } from '../../../core/models/paged-response.model';
import { DataTableComponent, ColumnConfig } from '../../../shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Dialog } from '@angular/cdk/dialog';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-visitor-list',
  standalone: true,
  imports: [RouterLink, DataTableComponent, PageHeaderComponent],
  template: `
    <app-page-header title="Visitors" subtitle="Manage all registered visitors">
      <a routerLink="/visitors/new" class="btn btn-primary">+ Add Visitor</a>
    </app-page-header>

    <app-data-table
      [data]="visitorData"
      [columns]="columns"
      [pageNumber]="pageNumber"
      [pageSize]="pageSize"
      [sortBy]="sortBy"
      [sortDirection]="sortDirection"
      (pageChange)="onPageChange($event)"
      (pageSizeChange)="onPageSizeChange($event)"
      (sort)="onSort($event)"
      (searchChange)="onSearch($event)"
      searchPlaceholder="Search by name, email, or phone..."
      emptyMessage="No visitors found"
    >
      <ng-template #actions let-item>
        <div class="action-btns">
          <a [routerLink]="['/visitors', item.id]" class="btn-icon" title="View">👁</a>
          <a [routerLink]="['/visitors', item.id, 'edit']" class="btn-icon" title="Edit">✏</a>
          <button class="btn-icon btn-icon-danger" (click)="confirmDelete(item)" title="Delete">🗑</button>
        </div>
      </ng-template>
    </app-data-table>
  `,
  styleUrls: ['./visitor-list.component.scss'],
})
export class VisitorListComponent implements OnInit {
  private visitorService = inject(VisitorService);
  private dialog = inject(Dialog);
  private notification = inject(NotificationService);
  private router = inject(Router);

  visitorData: PagedResponse<Visitor> | null = null;
  pageNumber = 1;
  pageSize = 10;
  sortBy = 'fullName';
  sortDirection: 'asc' | 'desc' = 'asc';
  searchTerm = '';

  columns: ColumnConfig[] = [
    { key: 'fullName', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'phone', label: 'Phone' },
    { key: 'organization', label: 'Organization' },
    { key: 'nationalId', label: 'National ID' },
  ];

  ngOnInit(): void {
    this.loadVisitors();
  }

  private loadVisitors(): void {
    this.visitorService.getAll({
      page: this.pageNumber,
      pageSize: this.pageSize,
      sortBy: this.sortBy,
      sortDirection: this.sortDirection,
      searchTerm: this.searchTerm,
    }).subscribe((data) => (this.visitorData = data));
  }

  onPageChange(page: number): void { this.pageNumber = page; this.loadVisitors(); }
  onPageSizeChange(size: number): void { this.pageSize = size; this.pageNumber = 1; this.loadVisitors(); }
  onSort(sort: { sortBy: string; sortDirection: 'asc' | 'desc' }): void { this.sortBy = sort.sortBy; this.sortDirection = sort.sortDirection; this.loadVisitors(); }
  onSearch(term: string): void { this.searchTerm = term; this.pageNumber = 1; this.loadVisitors(); }

  confirmDelete(visitor: Visitor): void {
    const dialogRef = this.dialog.open<boolean>(ConfirmDialogComponent, {
      data: {
        title: 'Delete Visitor',
        message: `Are you sure you want to delete "${visitor.fullName}"? This action cannot be undone.`,
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
        type: 'danger',
      } as ConfirmDialogData,
    });
    dialogRef.closed.subscribe((result) => {
      if (result) {
        this.visitorService.delete(visitor.id).subscribe(() => {
          this.notification.showSuccess('Visitor deleted successfully');
          this.loadVisitors();
        });
      }
    });
  }
}
