import { Component, Input, Output, EventEmitter, ContentChild, TemplateRef } from '@angular/core';
import { NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PagedResponse } from '../../../core/models/paged-response.model';
import { PAGE_SIZE_OPTIONS } from '../../../core/constants';
import { SearchBarComponent } from '../search-bar/search-bar.component';

export interface ColumnConfig {
  key: string;
  label: string;
  sortable?: boolean;
  pipe?: 'date' | 'uppercase' | 'status';
  width?: string;
  align?: 'left' | 'center' | 'right';
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [NgFor, NgIf, NgTemplateOutlet, FormsModule, SearchBarComponent],
  template: `
    <div class="table-container">
      <div class="table-toolbar">
        <app-search-bar
          [placeholder]="searchPlaceholder"
          (search)="onSearch($event)"
          (clearSearch)="onSearch('')"
        />
        <div class="table-toolbar-actions">
          <ng-content select="[toolbar-actions]"></ng-content>
          <select class="page-size-select" [ngModel]="pageSize" (ngModelChange)="onPageSizeChange($event)">
            <option *ngFor="let size of pageSizeOptions" [value]="size">{{ size }} / page</option>
          </select>
        </div>
      </div>

      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th *ngIf="showRowNumber" class="col-row-number">#</th>
              <th
                *ngFor="let col of columns"
                [style.width]="col.width"
                [class.sortable]="col.sortable"
                [class.text-center]="col.align === 'center'"
                [class.text-right]="col.align === 'right'"
                (click)="col.sortable && onSort(col.key)"
              >
                {{ col.label }}
                <span *ngIf="col.sortable && sortBy === col.key" class="sort-icon">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th *ngIf="showActions" class="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngIf="!data || data.items.length === 0">
              <td [attr.colspan]="columnCount" class="empty-state">
                <div class="empty-icon">📋</div>
                <p>{{ emptyMessage }}</p>
              </td>
            </tr>
            <tr *ngFor="let item of data?.items; let i = index">
              <td *ngIf="showRowNumber" class="col-row-number">
                {{ (pageNumber - 1) * pageSize + i + 1 }}
              </td>
              <td *ngFor="let col of columns" [class.text-center]="col.align === 'center'" [class.text-right]="col.align === 'right'">
                <ng-container *ngIf="!col.pipe">{{ item[col.key] }}</ng-container>
                <ng-container *ngIf="col.pipe === 'date'">{{ item[col.key] }}</ng-container>
              </td>
              <td *ngIf="showActions" class="col-actions">
                <ng-container *ngTemplateOutlet="actionsTemplate; context: { $implicit: item }"></ng-container>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-footer" *ngIf="data && data.totalPages > 0">
        <span class="table-info">
          Showing {{ ((pageNumber - 1) * pageSize) + 1 }}–{{ Math.min(pageNumber * pageSize, data.totalCount) }}
          of {{ data.totalCount }}
        </span>
        <div class="pagination">
          <button class="page-btn" [disabled]="pageNumber <= 1" (click)="onPageChange(pageNumber - 1)">
            ‹ Prev
          </button>
          <button
            *ngFor="let p of pageNumbers"
            class="page-btn"
            [class.active]="p === pageNumber"
            (click)="onPageChange(p)"
          >
            {{ p }}
          </button>
          <button class="page-btn" [disabled]="pageNumber >= data.totalPages" (click)="onPageChange(pageNumber + 1)">
            Next ›
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .table-container {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      overflow: hidden;
    }
    .table-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.25rem;
      gap: 1rem;
      flex-wrap: wrap;
      border-bottom: 1px solid #f1f5f9;
    }
    .table-toolbar-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .page-size-select {
      padding: 0.375rem 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 0.8125rem;
      background: #fff;
      cursor: pointer;
    }
    .table-scroll {
      overflow-x: auto;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;
    }
    .data-table thead {
      background: #f8fafc;
    }
    .data-table th {
      padding: 0.75rem 1rem;
      text-align: left;
      font-weight: 600;
      color: #475569;
      font-size: 0.8125rem;
      text-transform: uppercase;
      letter-spacing: 0.025em;
      white-space: nowrap;
      border-bottom: 1px solid #e2e8f0;
    }
    .data-table th.sortable {
      cursor: pointer;
      user-select: none;
    }
    .data-table th.sortable:hover {
      color: #3b82f6;
    }
    .sort-icon {
      margin-left: 0.25rem;
    }
    .data-table td {
      padding: 0.75rem 1rem;
      color: #334155;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
    }
    .data-table tbody tr:hover {
      background: #f8fafc;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .col-row-number { width: 50px; color: #94a3b8; }
    .col-actions { width: 120px; text-align: right; }
    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      color: #94a3b8;
    }
    .empty-icon {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }
    .table-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1.25rem;
      border-top: 1px solid #f1f5f9;
      flex-wrap: wrap;
      gap: 0.75rem;
    }
    .table-info {
      font-size: 0.8125rem;
      color: #64748b;
    }
    .pagination {
      display: flex;
      gap: 0.25rem;
    }
    .page-btn {
      padding: 0.375rem 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      background: #fff;
      color: #475569;
      font-size: 0.8125rem;
      cursor: pointer;
      transition: all 0.15s;
    }
    .page-btn:hover:not(:disabled) {
      background: #f1f5f9;
      border-color: #cbd5e1;
    }
    .page-btn.active {
      background: #3b82f6;
      color: #fff;
      border-color: #3b82f6;
    }
    .page-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  `],
})
export class DataTableComponent {
  @Input() data: PagedResponse<any> | null = null;
  @Input() columns: ColumnConfig[] = [];
  @Input() showRowNumber = true;
  @Input() showActions = true;
  @Input() pageNumber = 1;
  @Input() pageSize = 10;
  @Input() sortBy = '';
  @Input() sortDirection: 'asc' | 'desc' = 'asc';
  @Input() searchPlaceholder = 'Search...';
  @Input() emptyMessage = 'No records found';
  @Input() pageSizeOptions = PAGE_SIZE_OPTIONS;

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() sort = new EventEmitter<{ sortBy: string; sortDirection: 'asc' | 'desc' }>();
  @Output() searchChange = new EventEmitter<string>();

  @ContentChild('actions') actionsTemplate!: TemplateRef<unknown>;

  readonly Math = Math;

  get columnCount(): number {
    return (this.showRowNumber ? 1 : 0) + this.columns.length + (this.showActions ? 1 : 0);
  }

  get pageNumbers(): number[] {
    if (!this.data) return [];
    const total = this.data.totalPages;
    const current = this.pageNumber;
    const pages: number[] = [];
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  onPageChange(page: number): void {
    this.pageChange.emit(page);
  }

  onPageSizeChange(size: number): void {
    this.pageSizeChange.emit(size);
  }

  onSort(key: string): void {
    const direction = this.sortBy === key && this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.sort.emit({ sortBy: key, sortDirection: direction });
  }

  onSearch(term: string): void {
    this.searchChange.emit(term);
  }
}
