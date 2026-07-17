import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { VisitService } from '../../../core/services/visit.service';
import { Visit } from '../../../core/models/visit.model';
import { PagedResponse } from '../../../core/models/paged-response.model';
import { DataTableComponent, ColumnConfig } from '../../../shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-visit-list',
  standalone: true,
  imports: [RouterLink, NgIf, DataTableComponent, PageHeaderComponent],
  template: `
    <app-page-header title="Visits" subtitle="Track and manage all visits">
      <a routerLink="/visits/check-in" class="btn btn-primary">+ Check In</a>
    </app-page-header>

    <app-data-table
      [data]="visitData"
      [columns]="columns"
      [pageNumber]="pageNumber"
      [pageSize]="pageSize"
      [sortBy]="sortBy"
      [sortDirection]="sortDirection"
      (pageChange)="onPageChange($event)"
      (pageSizeChange)="onPageSizeChange($event)"
      (sort)="onSort($event)"
      (searchChange)="onSearch($event)"
      searchPlaceholder="Search by visitor, employee, or purpose..."
      emptyMessage="No visits recorded"
    >
      <ng-template #actions let-item>
        <div class="action-btns">
          <a [routerLink]="['/visits', item.id]" class="btn-icon" title="View">👁</a>
          <ng-container *ngIf="item.status === 'CheckedIn'">
            <a [routerLink]="['/visits', item.id, 'check-out']" class="btn-icon btn-icon-green" title="Check Out">🚪</a>
          </ng-container>
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
  `],
})
export class VisitListComponent implements OnInit {
  private visitService = inject(VisitService);

  visitData: PagedResponse<Visit> | null = null;
  pageNumber = 1;
  pageSize = 10;
  sortBy = 'visitDate';
  sortDirection: 'asc' | 'desc' = 'desc';
  searchTerm = '';

  columns: ColumnConfig[] = [
    { key: 'visitorName', label: 'Visitor', sortable: true },
    { key: 'employeeName', label: 'Employee', sortable: true },
    { key: 'purpose', label: 'Purpose' },
    { key: 'visitDate', label: 'Date', sortable: true },
    { key: 'checkInTime', label: 'Check In', pipe: 'date' },
    { key: 'status', label: 'Status', sortable: true },
  ];

  ngOnInit(): void { this.loadVisits(); }

  private loadVisits(): void {
    this.visitService.getAll({
      page: this.pageNumber,
      pageSize: this.pageSize,
      sortBy: this.sortBy,
      sortDirection: this.sortDirection,
      searchTerm: this.searchTerm,
    }).subscribe((data) => (this.visitData = data));
  }

  onPageChange(page: number): void { this.pageNumber = page; this.loadVisits(); }
  onPageSizeChange(size: number): void { this.pageSize = size; this.pageNumber = 1; this.loadVisits(); }
  onSort(sort: { sortBy: string; sortDirection: 'asc' | 'desc' }): void { this.sortBy = sort.sortBy; this.sortDirection = sort.sortDirection; this.loadVisits(); }
  onSearch(term: string): void { this.searchTerm = term; this.pageNumber = 1; this.loadVisits(); }
}
