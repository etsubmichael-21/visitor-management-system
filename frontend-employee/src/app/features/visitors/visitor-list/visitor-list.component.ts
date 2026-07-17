import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { VisitorService, Visitor } from '../../../core/services/visitor.service';

@Component({
  selector: 'app-visitor-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule,
    MatTableModule, MatPaginatorModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatCardModule
  ],
  template: `
    <div class="visitor-list">
      <div class="page-header">
        <h1>Visitors</h1>
      </div>

      <mat-card class="filter-card">
        <div class="filters">
          <mat-form-field appearance="outline">
            <mat-label>Search Visitors</mat-label>
            <input matInput [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" placeholder="Search by name, email, company...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
        </div>
      </mat-card>

      <mat-card>
        <div class="table-container">
          <table mat-table [dataSource]="visitors()">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Visitor</th>
              <td mat-cell *matCellDef="let v">
                <div class="name-cell">
                  <div class="avatar">{{ v.firstName.charAt(0) }}{{ v.lastName.charAt(0) }}</div>
                  <div>
                    <strong>{{ v.firstName }} {{ v.lastName }}</strong>
                    <small>{{ v.email }}</small>
                  </div>
                </div>
              </td>
            </ng-container>
            <ng-container matColumnDef="company">
              <th mat-header-cell *matHeaderCellDef>Company</th>
              <td mat-cell *matCellDef="let v">{{ v.company || 'N/A' }}</td>
            </ng-container>
            <ng-container matColumnDef="phone">
              <th mat-header-cell *matHeaderCellDef>Phone</th>
              <td mat-cell *matCellDef="let v">{{ v.phone }}</td>
            </ng-container>
            <ng-container matColumnDef="totalVisits">
              <th mat-header-cell *matHeaderCellDef>Total Visits</th>
              <td mat-cell *matCellDef="let v">{{ v.totalVisits }}</td>
            </ng-container>
            <ng-container matColumnDef="lastVisit">
              <th mat-header-cell *matHeaderCellDef>Last Visit</th>
              <td mat-cell *matCellDef="let v">{{ v.lastVisit || 'Never' }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let v">
                <span class="ecx-status-badge" [ngClass]="v.isBlacklisted ? 'rejected' : 'active'">
                  {{ v.isBlacklisted ? 'Blacklisted' : 'Active' }}
                </span>
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let v">
                <button mat-icon-button [routerLink]="['/admin/visitors', v.id]" matTooltip="View Details">
                  <mat-icon>visibility</mat-icon>
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
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #2e7d32; }
    .page-header h1 { font-size: 24px; font-weight: 500; color: #1b5e20; }
    .filter-card { margin-bottom: 16px; }
    .filters mat-form-field { width: 100%; }
    .table-container { overflow-x: auto; }
    .name-cell { display: flex; align-items: center; gap: 12px; }
    .avatar { width: 36px; height: 36px; border-radius: 50%; background: #2e7d32; color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; flex-shrink: 0; }
    .name-cell strong { display: block; font-size: 14px; }
    .name-cell small { font-size: 12px; color: #666; }
  `]
})
export class VisitorListComponent implements OnInit {
  private visitorService = inject(VisitorService);
  displayedColumns = ['name', 'company', 'phone', 'totalVisits', 'lastVisit', 'status', 'actions'];
  visitors = signal<Visitor[]>([]);
  totalCount = signal(0);
  pageSize = signal(10);
  currentPage = signal(0);
  searchTerm = '';
  private searchTimeout: any;

  ngOnInit(): void { this.loadVisitors(); }

  loadVisitors(): void {
    const filter: any = { page: (this.currentPage() + 1).toString(), limit: this.pageSize().toString() };
    if (this.searchTerm) filter.search = this.searchTerm;
    this.visitorService.getAll(filter).subscribe({
      next: (res) => { if (res.success && res.data) { this.visitors.set(res.data.items || []); this.totalCount.set(res.data.totalCount || 0); } }
    });
  }

  onSearch(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => { this.currentPage.set(0); this.loadVisitors(); }, 300);
  }

  onPageChange(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    this.currentPage.set(event.pageIndex);
    this.loadVisitors();
  }
}
