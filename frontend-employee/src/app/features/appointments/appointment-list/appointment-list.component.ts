import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/services/auth.service';
import { Appointment, AppointmentStatus } from '../../../core/models/appointment.model';

interface TabConfig {
  label: string;
  statuses: AppointmentStatus[];
}

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule,
    MatCardModule, MatTableModule, MatPaginatorModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatSelectModule, MatChipsModule,
    MatDatepickerModule, MatNativeDateModule,
    MatTabsModule, MatTooltipModule
  ],
  template: `
    <div class="appointment-list">
      <div class="page-header">
        <h1>Appointments & Visit History</h1>
        <button mat-raised-button color="primary" (click)="openNewAppointment()">
          <mat-icon>add</mat-icon> New Appointment
        </button>
      </div>

      <mat-card class="filter-card">
        <div class="filters">
          <mat-form-field appearance="outline">
            <mat-label>Search</mat-label>
            <input matInput [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" placeholder="Search appointments...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
          @if (!isCompletedTab()) {
            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select [(ngModel)]="selectedStatus" (ngModelChange)="onStatusFilterChange()">
                <mat-option value="">All Statuses</mat-option>
                <mat-option value="Pending">Pending</mat-option>
                <mat-option value="Approved">Approved</mat-option>
                <mat-option value="Rejected">Rejected</mat-option>
                <mat-option value="Completed">Completed</mat-option>
                <mat-option value="Cancelled">Cancelled</mat-option>
                <mat-option value="Rescheduled">Rescheduled</mat-option>
              </mat-select>
            </mat-form-field>
          }
          <mat-form-field appearance="outline">
            <mat-label>Date From</mat-label>
            <input matInput [matDatepicker]="fromPicker" [(ngModel)]="dateFrom" (dateChange)="loadAppointments()">
            <mat-datepicker-toggle matSuffix [for]="fromPicker"></mat-datepicker-toggle>
            <mat-datepicker #fromPicker></mat-datepicker>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Date To</mat-label>
            <input matInput [matDatepicker]="toPicker" [(ngModel)]="dateTo" (dateChange)="loadAppointments()">
            <mat-datepicker-toggle matSuffix [for]="toPicker"></mat-datepicker-toggle>
            <mat-datepicker #toPicker></mat-datepicker>
          </mat-form-field>
        </div>
        @if (activeChips().length > 0) {
          <div class="active-filters">
            @for (chip of activeChips(); track chip) {
              <mat-chip-row (removed)="removeChip(chip)">{{ chip }} <mat-icon matChipRemove>close</mat-icon></mat-chip-row>
            }
          </div>
        }
      </mat-card>

      <mat-card>
        <mat-tab-group
          [(selectedIndex)]="selectedTabIndex"
          (selectedIndexChange)="onTabChange($event)"
          animationDuration="200ms"
          class="appointment-tabs"
        >
          @for (tab of tabs; track tab.label; let i = $index) {
            <mat-tab>
              <ng-template mat-tab-label>
                <span class="tab-label">{{ tab.label }}</span>
                @if (tabCounts()[tab.label] !== undefined) {
                  <span class="tab-count">{{ tabCounts()[tab.label] }}</span>
                }
              </ng-template>
            </mat-tab>
          }
        </mat-tab-group>

        <div class="table-container">
          <table mat-table [dataSource]="appointments()">
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date & Time</th>
              <td mat-cell *matCellDef="let apt">
                <strong>{{ apt.requestedDate }}</strong><br>
                <small>{{ apt.requestedStartTime }} - {{ apt.requestedEndTime }}</small>
              </td>
            </ng-container>

            <ng-container matColumnDef="title">
              <th mat-header-cell *matHeaderCellDef>Visitor / Purpose</th>
              <td mat-cell *matCellDef="let apt">
                <strong>{{ apt.purpose }}</strong>
                <br><small>{{ apt.visitorName }}</small>
              </td>
            </ng-container>

            <ng-container matColumnDef="host">
              <th mat-header-cell *matHeaderCellDef>Host</th>
              <td mat-cell *matCellDef="let apt">{{ apt.employeeName || 'N/A' }}</td>
            </ng-container>

            <ng-container matColumnDef="department">
              <th mat-header-cell *matHeaderCellDef>Department</th>
              <td mat-cell *matCellDef="let apt">{{ apt.departmentName || 'N/A' }}</td>
            </ng-container>

            <ng-container matColumnDef="checkIn">
              <th mat-header-cell *matHeaderCellDef>Check In</th>
              <td mat-cell *matCellDef="let apt">
                @if (apt.checkInTime) {
                  <span class="visit-time">{{ apt.checkInTime }}</span>
                } @else {
                  <span class="no-data">—</span>
                }
              </td>
            </ng-container>

            <ng-container matColumnDef="checkOut">
              <th mat-header-cell *matHeaderCellDef>Check Out</th>
              <td mat-cell *matCellDef="let apt">
                @if (apt.checkOutTime) {
                  <span class="visit-time">{{ apt.checkOutTime }}</span>
                } @else {
                  <span class="no-data">—</span>
                }
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let apt">
                <span class="ecx-status-badge" [ngClass]="apt.status.toLowerCase()">{{ apt.status }}</span>
                @if (apt.isConfidential) {
                  <mat-icon class="confidential-icon" matTooltip="Confidential">lock</mat-icon>
                }
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let apt">
                <button mat-icon-button [routerLink]="['/appointments', apt.id]" matTooltip="View details" aria-label="View appointment details">
                  <mat-icon>visibility</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns()"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns();" class="clickable-row"
                (click)="viewAppointment(row)"></tr>
          </table>

          @if (appointments().length === 0) {
            <div class="empty-state">
              <mat-icon>event_busy</mat-icon>
              <p>No appointments found for this filter.</p>
            </div>
          }
        </div>

        <mat-paginator
          [length]="totalCount()"
          [pageSize]="pageSize()"
          [pageSizeOptions]="[10, 25, 50]"
          (page)="onPageChange($event)"
          showFirstLastButtons
        >
        </mat-paginator>
      </mat-card>
    </div>
  `,
  styles: [`
    .appointment-list { padding: 0; }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid #2e7d32;
    }
    .page-header h1 { font-size: 24px; font-weight: 500; color: #1b5e20; margin: 0; }
    .page-header button { display: flex; align-items: center; gap: 8px; }

    .filter-card { margin-bottom: 16px; }
    .filters { display: flex; gap: 16px; flex-wrap: wrap; }
    .filters mat-form-field { flex: 1; min-width: 180px; }
    .active-filters { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }

    .appointment-tabs { margin-bottom: 0; }

    .tab-label { font-weight: 500; }
    .tab-count {
      margin-left: 8px;
      background: rgba(46, 125, 50, 0.12);
      color: #2e7d32;
      border-radius: 12px;
      padding: 0 8px;
      font-size: 12px;
      font-weight: 600;
      min-width: 20px;
      text-align: center;
      line-height: 22px;
    }

    :host ::ng-deep .mat-mdc-tab .mdc-tab-indicator__content--underline {
      border-color: #2e7d32;
    }
    :host ::ng-deep .mat-mdc-tab.mdc-tab--active .mdc-tab__text-label {
      color: #2e7d32;
    }

    .table-container { overflow-x: auto; }

    .clickable-row { cursor: pointer; }
    .clickable-row:hover { background-color: #f1f8e9; }

    .confidential-icon { color: #7b1fa2; font-size: 18px; width: 18px; height: 18px; margin-left: 8px; vertical-align: middle; }

    .visit-time { color: #2e7d32; font-weight: 500; }
    .no-data { color: #9e9e9e; }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 16px;
      color: #9e9e9e;
    }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 12px; }
    .empty-state p { margin: 0; font-size: 16px; }
  `]
})
export class AppointmentListComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  private authService = inject(AuthService);
  private router = inject(Router);

  private searchTimeout: any;

  tabs: TabConfig[] = [
    { label: 'All', statuses: [] },
    { label: 'Active', statuses: ['Approved', 'Rescheduled'] },
    { label: 'Pending', statuses: ['Pending'] },
    { label: 'Completed', statuses: ['Completed'] },
    { label: 'Rejected', statuses: ['Rejected'] },
    { label: 'Cancelled', statuses: ['Cancelled'] }
  ];

  selectedTabIndex = 0;
  searchTerm = '';
  selectedStatus = '';
  dateFrom: Date | null = null;
  dateTo: Date | null = null;

  appointments = signal<Appointment[]>([]);
  totalCount = signal(0);
  pageSize = signal(10);
  currentPage = signal(0);
  activeChips = signal<string[]>([]);
  tabCounts = signal<Record<string, number>>({});

  readonly defaultColumns: string[] = ['date', 'title', 'host', 'department', 'status', 'actions'];
  readonly visitColumns: string[] = ['date', 'title', 'host', 'department', 'checkIn', 'checkOut', 'status', 'actions'];

  displayedColumns = computed<string[]>(() => {
    const tab = this.tabs[this.selectedTabIndex];
    return tab && tab.label === 'Completed' ? this.visitColumns : this.defaultColumns;
  });

  isCompletedTab = computed(() => this.tabs[this.selectedTabIndex]?.label === 'Completed');

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    const tab = this.tabs[this.selectedTabIndex];
    const filter: Record<string, string> = {
      page: (this.currentPage() + 1).toString(),
      limit: this.pageSize().toString()
    };

    if (this.searchTerm) {
      filter['search'] = this.searchTerm;
    }

    const effectiveStatus = this.selectedStatus || (tab.statuses.length === 1 ? tab.statuses[0] : '');
    if (effectiveStatus) {
      filter['status'] = effectiveStatus;
    }

    if (this.dateFrom) {
      filter['dateFrom'] = this.dateFrom.toISOString().split('T')[0];
    }
    if (this.dateTo) {
      filter['dateTo'] = this.dateTo.toISOString().split('T')[0];
    }

    this.updateChips(effectiveStatus, tab.label);

    this.appointmentService.getAll(filter as any).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          let items = res.data.items || [];
          let total = res.data.totalCount || 0;

          if (tab.statuses.length > 1 && !this.selectedStatus) {
            items = items.filter(a => tab.statuses.includes(a.status));
          }

          this.appointments.set(items);
          this.totalCount.set(total);
        }
      }
    });
  }

  loadTabCounts(): void {
    const statusGroups: { label: string; statuses: AppointmentStatus[] }[] = [
      { label: 'Active', statuses: ['Approved', 'Rescheduled'] },
      { label: 'Pending', statuses: ['Pending'] },
      { label: 'Completed', statuses: ['Completed'] },
      { label: 'Rejected', statuses: ['Rejected'] },
      { label: 'Cancelled', statuses: ['Cancelled'] }
    ];

    const counts: Record<string, number> = {};
    let completed = 0;

    for (const group of statusGroups) {
      for (const status of group.statuses) {
        this.appointmentService.getAll({ status, limit: '1' } as any).subscribe({
          next: (res) => {
            if (res.success && res.data) {
              const count = res.data.totalCount || 0;
              if (group.label === 'Active') {
                counts['Active'] = (counts['Active'] || 0) + count;
              } else {
                counts[group.label] = count;
              }
              this.tabCounts.set({ ...counts });
            }
          }
        });
      }
    }
  }

  onTabChange(index: number): void {
    this.selectedTabIndex = index;
    this.currentPage.set(0);
    this.selectedStatus = '';
    this.loadAppointments();
  }

  onStatusFilterChange(): void {
    this.currentPage.set(0);
    this.loadAppointments();
  }

  onSearch(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(0);
      this.loadAppointments();
    }, 300);
  }

  onPageChange(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    this.currentPage.set(event.pageIndex);
    this.loadAppointments();
  }

  removeChip(chip: string): void {
    if (chip.startsWith('Status:')) {
      this.selectedStatus = '';
    }
    if (chip.startsWith('Search:')) {
      this.searchTerm = '';
    }
    this.currentPage.set(0);
    this.loadAppointments();
  }

  viewAppointment(apt: Appointment): void {
    this.router.navigate(['/appointments', apt.id]);
  }

  openNewAppointment(): void {
    const role = this.authService.getUserRole();
    const prefix = role === 'Admin' ? '/admin' : role === 'CEO' ? '/ceo' : role === 'DepartmentHead' ? '/dept' : '/emp';
  }

  private updateChips(status: string, tabLabel: string): void {
    const chips: string[] = [];
    if (tabLabel !== 'All') {
      chips.push(`Tab: ${tabLabel}`);
    }
    if (status) {
      chips.push(`Status: ${status}`);
    }
    if (this.searchTerm) {
      chips.push(`Search: ${this.searchTerm}`);
    }
    this.activeChips.set(chips);
  }
}
