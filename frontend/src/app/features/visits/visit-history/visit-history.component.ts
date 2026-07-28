import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, DestroyRef } from '@angular/core';
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
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { VisitService } from '../../../core/services/visit.service';
import { AuthService } from '../../../core/services/auth.service';
import { Visit } from '../../../core/models/visit.model';

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
          <input matInput [(ngModel)]="searchTerm" (ngModelChange)="onSearchChange()" placeholder="Search by purpose or host..." />
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
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (errorMessage) {
        <div class="error-state">
          <mat-icon class="error-icon">error_outline</mat-icon>
          <h3>Something went wrong</h3>
          <p>{{ errorMessage }}</p>
          <button mat-stroked-button color="primary" (click)="loadVisits()">
            <mat-icon>refresh</mat-icon>
            Try Again
          </button>
        </div>
      } @else if (paginatedVisits.length === 0) {
        <div class="empty-state">
          <mat-icon class="empty-icon">history</mat-icon>
          <h3>No visit history found</h3>
          <p>{{ searchTerm || statusFilter ? 'Try adjusting your search or filters' : 'You have not made any visits yet' }}</p>
          @if (!searchTerm && !statusFilter) {
            <a mat-raised-button color="primary" routerLink="/appointments/new">
              <mat-icon>add</mat-icon>
              Book an Appointment
            </a>
          }
        </div>
      } @else {
        <div class="visit-list">
          @for (visit of paginatedVisits; track visit.id) {
            <mat-card class="visit-card" [class]="'visit-' + (visit.status || '').toLowerCase()">
              <mat-card-content>
                <div class="visit-header">
                  <span class="visit-date">{{ visit.visitDate }}</span>
                  <mat-chip [class]="'status-chip status-' + (visit.status || '').toLowerCase()">
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
                    <mat-icon>business</mat-icon>
                    <span>Dept: {{ visit.departmentName || 'N/A' }}</span>
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

        @if (filteredVisits.length > pageSize) {
          <mat-paginator
            [length]="filteredVisits.length"
            [pageSize]="pageSize"
            [pageIndex]="pageIndex"
            [pageSizeOptions]="[5, 10, 20]"
            (page)="onPageChange($event)"
            showFirstLastButtons>
          </mat-paginator>
        }
      }
    </div>
  `,
  styleUrls: ['./visit-history.component.scss'],
})
export class VisitHistoryComponent implements OnInit, OnDestroy {
  private visitService = inject(VisitService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  allVisits: Visit[] = [];
  filteredVisits: Visit[] = [];
  paginatedVisits: Visit[] = [];
  loading = true;
  errorMessage = '';
  searchTerm = '';
  statusFilter = '';
  pageSize = 10;
  pageIndex = 0;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe(() => {
      this.pageIndex = 0;
      this.applyFilters();
    });

    this.loadVisits();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchTerm);
  }

  onFilterChange(): void {
    this.pageIndex = 0;
    this.applyFilters();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedVisits();
  }

  loadVisits(): void {
    this.loading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    const userId = this.authService.currentUser?.id;
    if (!userId) {
      this.errorMessage = 'You must be logged in to view visit history.';
      this.loading = false;
      this.cdr.markForCheck();
      return;
    }

    this.visitService.getByVisitor(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (visits) => {
          this.allVisits = visits || [];
          this.applyFilters();
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.errorMessage = err?.message || 'Failed to load visit history. Please try again.';
          this.allVisits = [];
          this.filteredVisits = [];
          this.paginatedVisits = [];
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  private applyFilters(): void {
    const term = this.searchTerm.toLowerCase().trim();
    const status = this.statusFilter.trim().toLowerCase();

    let result = [...this.allVisits];

    if (status) {
      result = result.filter(v => v.status?.toLowerCase() === status);
    }

    if (term) {
      result = result.filter(v =>
        v.purpose?.toLowerCase().includes(term) ||
        v.employeeName?.toLowerCase().includes(term) ||
        v.departmentName?.toLowerCase().includes(term) ||
        v.visitorName?.toLowerCase().includes(term)
      );
    }

    result.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    this.filteredVisits = result;
    this.updatePaginatedVisits();
    this.cdr.markForCheck();
  }

  private updatePaginatedVisits(): void {
    const start = this.pageIndex * this.pageSize;
    this.paginatedVisits = this.filteredVisits.slice(start, start + this.pageSize);
    this.cdr.markForCheck();
  }
}
