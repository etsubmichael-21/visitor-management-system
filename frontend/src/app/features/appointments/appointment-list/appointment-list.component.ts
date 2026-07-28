import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil, finalize } from 'rxjs/operators';
import { AppointmentService } from '../../../core/services/appointment.service';
import { Appointment } from '../../../core/models/appointment.model';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="appointments-page fade-in">
      <div class="page-header">
        <div>
          <h1 class="page-title">My Appointments</h1>
          <p class="page-subtitle">Manage your scheduled visits</p>
        </div>
        <a mat-flat-button color="primary" routerLink="/appointments/new" class="new-btn">
          <mat-icon>add</mat-icon>
          Request Appointment
        </a>
      </div>

      <div class="filters-bar">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search</mat-label>
          <input matInput [formControl]="searchControl" placeholder="Search by subject, host...">
          <mat-icon matPrefix>search</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline" class="status-filter">
          <mat-label>Status</mat-label>
          <mat-select [formControl]="statusControl">
            <mat-option value="">All Statuses</mat-option>
            <mat-option value="Pending">Pending</mat-option>
            <mat-option value="Approved">Approved</mat-option>
            <mat-option value="Rejected">Rejected</mat-option>
            <mat-option value="Cancelled">Cancelled</mat-option>
            <mat-option value="Completed">Completed</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      @if (loading) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      }

      @if (!loading && filteredAppointments.length === 0) {
        <div class="empty-state">
          <mat-icon>event_busy</mat-icon>
          <h3>No appointments found</h3>
          <p>You haven't scheduled any appointments yet.</p>
          <a mat-flat-button color="primary" routerLink="/appointments/new">
            <mat-icon>add</mat-icon>
            Request Your First Appointment
          </a>
        </div>
      }

      @if (!loading && filteredAppointments.length > 0) {
        <div class="appointments-list">
          @for (apt of filteredAppointments; track apt.id) {
            <mat-card class="appointment-card" [routerLink]="['/appointments', apt.id]">
              <mat-card-content>
                <div class="apt-main">
                  <div class="apt-icon">
                    <mat-icon>event</mat-icon>
                  </div>
                  <div class="apt-info">
                    <h3>{{ apt.purpose }}</h3>
                    <p class="apt-meta">
                      <mat-icon>person</mat-icon> {{ apt.employeeName || 'Host' }}
                      <span class="separator">|</span>
                      <mat-icon>business</mat-icon> {{ apt.departmentName || 'Department' }}
                    </p>
                    <p class="apt-date">
                      <mat-icon>calendar_today</mat-icon> {{ apt.requestedDate | date:'mediumDate' }}
                      <span class="separator">|</span>
                      <mat-icon>schedule</mat-icon> {{ apt.requestedStartTime }}
                    </p>
                  </div>
                </div>
                <div class="apt-status">
                  <span class="status-badge" [class]="apt.status">{{ apt.status }}</span>
                </div>
              </mat-card-content>
            </mat-card>
          }
        </div>
      }

      @if (totalCount > pageSize) {
        <mat-paginator
          [length]="totalCount"
          [pageSize]="pageSize"
          [pageIndex]="pageIndex"
          [pageSizeOptions]="[5, 10, 20]"
          (page)="onPageChange($event)"
          showFirstLastButtons>
        </mat-paginator>
      }
    </div>
  `,
  styleUrls: ['./appointment-list.component.scss'],
})
export class AppointmentListComponent implements OnInit, OnDestroy {
  private appointmentService = inject(AppointmentService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  loading = true;
  totalCount = 0;
  pageSize = 10;
  pageIndex = 0;

  searchControl = new FormControl('');
  statusControl = new FormControl('');

  ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.applyFilters());

    this.statusControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.applyFilters());

    this.loadAppointments();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAppointments(): void {
    this.loading = true;

    this.appointmentService
      .getAppointments({
        page: this.pageIndex + 1,
        pageSize: this.pageSize,
      })
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (res) => {
          this.appointments = res.items;
          this.totalCount = res.totalCount;
          this.applyFilters();
        },
        error: () => {
          this.filteredAppointments = [];
          this.cdr.markForCheck();
        },
      });
  }

  applyFilters(): void {
    const searchTerm = (this.searchControl.value ?? '').toLowerCase().trim();
    const status = (this.statusControl.value ?? '').trim().toLowerCase();

    let result = [...this.appointments];

    if (status) {
      result = result.filter(a =>
        a.status?.trim().toLowerCase() === status
      );
    }

    if (searchTerm) {
      result = result.filter(a =>
        a.purpose?.toLowerCase().includes(searchTerm) ||
        a.employeeName?.toLowerCase().includes(searchTerm) ||
        a.departmentName?.toLowerCase().includes(searchTerm) ||
        a.status?.toLowerCase().includes(searchTerm)
      );
    }

    this.filteredAppointments = result;
    this.cdr.markForCheck();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadAppointments();
  }
}
