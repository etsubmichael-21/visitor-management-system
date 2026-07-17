import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AppointmentService } from '../../../core/services/appointment.service';
import { Appointment, AppointmentStatus } from '../../../core/models/appointment.model';
import { PagedResponse } from '../../../core/models/common.model';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
          <input matInput [(ngModel)]="searchTerm" placeholder="Search appointments...">
          <mat-icon matPrefix>search</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline" class="status-filter">
          <mat-label>Status</mat-label>
          <mat-select [(ngModel)]="statusFilter" (selectionChange)="loadAppointments()">
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

      @if (!loading && appointments.length === 0) {
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

      @if (!loading && appointments.length > 0) {
        <div class="appointments-list">
          @for (apt of appointments; track apt.id) {
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
  styles: [`
    .appointments-page { max-width: 900px; margin: 0 auto; }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }

    .page-title {
      font-size: 24px;
      font-weight: 700;
      color: #1b5e20;
    }

    .page-subtitle {
      color: #64748b;
      font-size: 14px;
      margin-top: 2px;
    }

    .new-btn {
      height: 42px;
      padding: 0 20px;
      font-weight: 600;
      background: #2e7d32 !important;
    }

    .filters-bar {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
    }

    .search-field { flex: 1; }
    .status-filter { width: 180px; }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 60px 0;
    }

    .empty-state {
      text-align: center;
      padding: 60px 24px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #cbd5e1;
    }

    .empty-state h3 {
      font-size: 18px;
      font-weight: 600;
      color: #475569;
      margin: 16px 0 8px;
    }

    .empty-state p {
      color: #94a3b8;
      font-size: 14px;
      margin-bottom: 20px;
    }

    .appointments-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .appointment-card {
      cursor: pointer;
      transition: transform 0.15s, box-shadow 0.15s;
    }

    .appointment-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }

    .appointment-card mat-card-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
    }

    .apt-main {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .apt-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: #e8f5e9;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .apt-icon mat-icon { color: #2e7d32; }

    .apt-info h3 {
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
    }

    .apt-meta, .apt-date {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: #64748b;
      margin-top: 2px;
    }

    .apt-meta mat-icon, .apt-date mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .separator { margin: 0 8px; color: #cbd5e1; }

    mat-paginator { margin-top: 16px; }

    @media (max-width: 768px) {
      .page-header { flex-direction: column; gap: 12px; }
      .filters-bar { flex-direction: column; }
      .status-filter { width: 100%; }
      .appointment-card mat-card-content { flex-direction: column; align-items: flex-start; gap: 12px; }
    }
  `],
})
export class AppointmentListComponent implements OnInit {
  private appointmentService = inject(AppointmentService);

  appointments: Appointment[] = [];
  loading = true;
  searchTerm = '';
  statusFilter = '';
  totalCount = 0;
  pageSize = 10;
  pageIndex = 0;

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading = true;
    this.appointmentService
      .getAppointments({
        page: this.pageIndex + 1,
        pageSize: this.pageSize,
        status: (this.statusFilter as AppointmentStatus) || undefined,
        search: this.searchTerm || undefined,
      })
      .subscribe({
        next: (res) => {
          this.appointments = res.items;
          this.totalCount = res.totalCount;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadAppointments();
  }
}
