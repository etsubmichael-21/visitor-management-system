import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { VisitService } from '../../../core/services/visit.service';
import { AuthService } from '../../../core/services/auth.service';
import { Visit, VisitStatus } from '../../../core/models/visit.model';
import { PagedResponse } from '../../../core/models/paged-response.model';

@Component({
  selector: 'app-visit-history',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSelectModule,
  ],
  template: `
    <div class="history-page">
      <div class="page-header">
        <h1 class="page-title">Visit History</h1>
        <p class="page-subtitle">View your complete visit history</p>
      </div>

      <div class="filters">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search visits</mat-label>
          <input matInput [(ngModel)]="searchTerm" (ngModelChange)="onSearchChange()" placeholder="Search by purpose or employee..." />
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline" class="status-field">
          <mat-label>Status</mat-label>
          <mat-select [(ngModel)]="statusFilter" (selectionChange)="onFilterChange()">
            <mat-option value="">All</mat-option>
            <mat-option value="Scheduled">Scheduled</mat-option>
            <mat-option value="CheckedIn">Checked In</mat-option>
            <mat-option value="CheckedOut">Checked Out</mat-option>
            <mat-option value="Cancelled">Cancelled</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      @if (loading) {
        <div class="loading-container">
          <mat-spinner diameter="40" />
        </div>
      } @else if (visits.length === 0) {
        <div class="empty-state">
          <mat-icon class="empty-icon">history</mat-icon>
          <h3>No visit history found</h3>
          <p>{{ searchTerm || statusFilter ? 'Try adjusting your filters' : 'You have not made any visits yet' }}</p>
          @if (!searchTerm && !statusFilter) {
            <a mat-raised-button color="primary" routerLink="/visits/check-in">Schedule a Visit</a>
          }
        </div>
      } @else {
        <div class="visit-list">
          @for (visit of visits; track visit.id) {
            <mat-card class="visit-card" [class]="'visit-' + visit.status.toLowerCase()">
              <mat-card-content>
                <div class="visit-header">
                  <span class="visit-date">{{ visit.visitDate }}</span>
                  <mat-chip [class]="'status-chip status-' + visit.status.toLowerCase()">
                    {{ visit.status === 'CheckedIn' ? 'Checked In' : visit.status }}
                  </mat-chip>
                </div>
                <h3 class="visit-purpose">{{ visit.purpose }}</h3>
                <div class="visit-details">
                  <div class="detail">
                    <mat-icon>person</mat-icon>
                    <span>Host: {{ visit.employeeName || 'N/A' }}</span>
                  </div>
                  <div class="detail">
                    <mat-icon>login</mat-icon>
                    <span>Check-in: {{ visit.checkInTime || '—' }}</span>
                  </div>
                  <div class="detail">
                    <mat-icon>logout</mat-icon>
                    <span>Check-out: {{ visit.checkOutTime || '—' }}</span>
                  </div>
                  @if (visit.badgeNumber) {
                    <div class="detail">
                      <mat-icon>badge</mat-icon>
                      <span>Badge: {{ visit.badgeNumber }}</span>
                    </div>
                  }
                </div>
              </mat-card-content>
            </mat-card>
          }
        </div>

        <mat-paginator
          [length]="totalCount"
          [pageSize]="pageSize"
          [pageIndex]="pageIndex"
          [pageSizeOptions]="[5, 10, 20]"
          (page)="onPageChange($event)"
          showFirstLastButtons
        />
      }
    </div>
  `,
  styleUrls: ['./visit-history.component.scss'],
})
export class VisitHistoryComponent implements OnInit {
  private visitService = inject(VisitService);
  private authService = inject(AuthService);

  visits: Visit[] = [];
  totalCount = 0;
  pageSize = 10;
  pageIndex = 0;
  searchTerm = '';
  statusFilter = '';
  loading = true;

  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
    ).subscribe(() => this.loadVisits());

    this.loadVisits();
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchTerm);
  }

  onFilterChange(): void {
    this.pageIndex = 0;
    this.loadVisits();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadVisits();
  }

  private loadVisits(): void {
    this.loading = true;
    const userId = this.authService.currentUser?.id;
    this.visitService.getAll({
      page: this.pageIndex + 1,
      pageSize: this.pageSize,
      searchTerm: this.searchTerm || undefined,
      visitorId: userId,
      status: this.statusFilter || undefined,
    }).subscribe({
      next: (data: PagedResponse<Visit>) => {
        this.visits = data.items;
        this.totalCount = data.totalCount;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
