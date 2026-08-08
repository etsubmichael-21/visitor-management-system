import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AppointmentService } from '../../core/services/appointment.service';
import { Appointment, AppointmentProperty, PropertyVerificationItem } from '../../core/models/appointment.model';

type VerificationStatus = 'Verified' | 'Missing' | 'Additional Property' | 'Rejected';

interface VerificationRow {
  key: number;
  id?: number;
  propertyType: string;
  propertyName: string;
  brand: string;
  model: string;
  serialNumber: string;
  quantity: number;
  status: VerificationStatus;
  error?: string;
}

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule,
    MatCardModule, MatIconModule, MatButtonModule, MatDividerModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatTooltipModule,
    MatProgressSpinnerModule, MatSnackBarModule
  ],
  template: `
    <div class="verify-page">
      <div class="page-header">
        <h1>Visitor Verification</h1>
      </div>

      <div class="stat-row">
        <div class="stat-card" style="border-left: 4px solid #D4A017;">
          <div class="stat-icon" style="background: #fff8e1; color: #b26a00;"><mat-icon>hourglass_top</mat-icon></div>
          <div class="stat-info">
            <h3>{{ pendingVerifications().length }}</h3>
            <p>Pending Verifications</p>
          </div>
        </div>
        <div class="stat-card" style="border-left: 4px solid #0F6B3A;">
          <div class="stat-icon" style="background: #e8f5e9; color: #0F6B3A;"><mat-icon>today</mat-icon></div>
          <div class="stat-info">
            <h3>{{ verifiedToday() }}</h3>
            <p>Verified Today</p>
          </div>
        </div>
        <div class="stat-card" style="border-left: 4px solid #1565c0;">
          <div class="stat-icon" style="background: #e3f2fd; color: #1565c0;"><mat-icon>verified_user</mat-icon></div>
          <div class="stat-info">
            <h3>{{ totalVerified() }}</h3>
            <p>Total Verified</p>
          </div>
        </div>
        <div class="stat-card" style="border-left: 4px solid #c62828;">
          <div class="stat-icon" style="background: #ffebee; color: #c62828;"><mat-icon>block</mat-icon></div>
          <div class="stat-info">
            <h3>{{ rejectedCount() }}</h3>
            <p>Rejected</p>
          </div>
        </div>
      </div>

      <mat-card class="section-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>pending_actions</mat-icon> Pending Verifications
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          @if (pendingLoading()) {
            <div class="loading-row"><mat-spinner diameter="28"></mat-spinner></div>
          } @else if (pendingVerifications().length) {
            <div class="pending-list">
              @for (apt of pendingVerifications(); track apt.id) {
                <div class="verify-card">
                  <div class="verify-card-header">
                    <div class="visitor-avatar">{{ (apt.visitorName || '?').charAt(0) }}</div>
                    <div class="visitor-main">
                      <strong>{{ apt.visitorName }}</strong>
                      <small>Badge: {{ apt.badgeNumber || 'Not issued' }} &middot; {{ apt.requestedDate }} {{ apt.requestedStartTime }}</small>
                    </div>
                  </div>
                  <div class="visitor-details">
                    <p><mat-icon>person</mat-icon> Host: {{ apt.employeeName }}</p>
                    <p><mat-icon>domain</mat-icon> Department: {{ apt.departmentName }}</p>
                    <p><mat-icon>flag</mat-icon> Purpose: {{ apt.purpose }}</p>
                    <p><mat-icon>schedule</mat-icon> Check-In: {{ apt.visitCheckInTime || 'Not checked in' }}</p>
                    <p><mat-icon>inventory_2</mat-icon> Items Carried: {{ propertySummary(apt) }}</p>
                    <p><mat-icon>verified</mat-icon> Status: <span class="pending-chip">Pending</span></p>
                  </div>
                  <div class="verify-card-actions">
                    <button mat-raised-button color="primary" (click)="openVerification(apt)">
                      <mat-icon>verified_user</mat-icon> Verify
                    </button>
                    <button mat-stroked-button color="primary" [routerLink]="['/appointments', apt.id]">
                      <mat-icon>visibility</mat-icon> View Details
                    </button>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="empty-state">
              <mat-icon>verified</mat-icon>
              <p>No pending verifications</p>
            </div>
          }
        </mat-card-content>
      </mat-card>

      @if (selectedAppointment()) {
        <mat-card class="verification-form-card">
          <mat-card-header>
            <mat-card-title>Verify: {{ selectedAppointment()!.visitorName }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="visitor-summary">
              <p><strong>Visitor:</strong> {{ selectedAppointment()!.visitorName }} <small>(Badge: {{ selectedAppointment()!.badgeNumber || 'Not issued' }})</small></p>
              <p><strong>Host:</strong> {{ selectedAppointment()!.employeeName }} &middot; {{ selectedAppointment()!.departmentName }}</p>
              <p><strong>Purpose:</strong> {{ selectedAppointment()!.purpose }}</p>
              <p><strong>Appointment:</strong> {{ selectedAppointment()!.requestedDate }} {{ selectedAppointment()!.requestedStartTime }} - {{ selectedAppointment()!.requestedEndTime }}</p>
              <p><strong>Check-In Time:</strong> {{ selectedAppointment()!.visitCheckInTime || 'Not checked in' }}</p>
            </div>

            <div class="property-section">
              <div class="property-section-head">
                <h3>Carried Items - Verification</h3>
                <span class="property-status unverified">
                  <mat-icon>warning</mat-icon> Confirm each item
                </span>
              </div>

              @if (verificationRows().length) {
                <div class="verification-table-wrap">
                  <table class="verification-table">
                    <thead>
                      <tr>
                        <th>Property Type</th>
                        <th>Property Name</th>
                        <th>Brand</th>
                        <th>Model</th>
                        <th>Serial Number</th>
                        <th>Qty</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (row of verificationRows(); track row.key) {
                        <tr [class.invalid]="row.error">
                          <td>
                            <mat-form-field appearance="outline">
                              <mat-label>Type</mat-label>
                              <mat-select [(ngModel)]="row.propertyType" (ngModelChange)="onVerificationTypeChange(row)">
                                @for (type of propertyTypes; track type) {
                                  <mat-option [value]="type">{{ type }}</mat-option>
                                }
                              </mat-select>
                            </mat-form-field>
                          </td>
                          <td>
                            @if (row.propertyType === 'Other') {
                              <mat-form-field appearance="outline">
                                <mat-label>Name *</mat-label>
                                <input matInput [(ngModel)]="row.propertyName" placeholder="e.g. Custom device">
                              </mat-form-field>
                            }
                          </td>
                          <td>
                            <mat-form-field appearance="outline">
                              <mat-label>Brand</mat-label>
                              <input matInput [(ngModel)]="row.brand">
                            </mat-form-field>
                          </td>
                          <td>
                            <mat-form-field appearance="outline">
                              <mat-label>Model</mat-label>
                              <input matInput [(ngModel)]="row.model">
                            </mat-form-field>
                          </td>
                          <td>
                            <mat-form-field appearance="outline">
                              <mat-label>Serial</mat-label>
                              <input matInput [(ngModel)]="row.serialNumber">
                            </mat-form-field>
                          </td>
                          <td>
                            <mat-form-field appearance="outline" class="qty-field">
                              <mat-label>Qty</mat-label>
                              <input matInput type="number" min="1" [(ngModel)]="row.quantity">
                            </mat-form-field>
                          </td>
                          <td>
                            <mat-form-field appearance="outline" class="status-field">
                              <mat-label>Status</mat-label>
                              <mat-select [(ngModel)]="row.status">
                                @for (s of verificationStatuses; track s) {
                                  <mat-option [value]="s">{{ s }}</mat-option>
                                }
                              </mat-select>
                            </mat-form-field>
                          </td>
                          <td>
                            <button type="button" mat-icon-button matTooltip="Remove property" aria-label="Remove property" (click)="removeVerificationRow($index)">
                              <mat-icon>delete_outline</mat-icon>
                            </button>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>

                @if (verificationError()) {
                  <p class="verification-error"><mat-icon>error</mat-icon> {{ verificationError() }}</p>
                }
              }

              <div class="verification-actions">
                <button type="button" mat-stroked-button color="primary" (click)="addVerificationRow()">
                  <mat-icon>add</mat-icon> Add Property
                </button>
                <div class="verification-buttons">
                  <button mat-stroked-button (click)="closeVerification()">Cancel</button>
                  <button mat-raised-button color="primary" class="verify-props-btn" (click)="saveVerification()" [disabled]="verifying()">
                    <mat-icon>verified_user</mat-icon> {{ verifying() ? 'Saving...' : 'Save Verification' }}
                  </button>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      }

      <mat-card class="section-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>history</mat-icon> Verified History
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="history-calendar">
            <div class="history-calendar-header">
              <button mat-icon-button (click)="prevHistoryMonth()" matTooltip="Previous month" aria-label="Go to previous month"><mat-icon>chevron_left</mat-icon></button>
              <h3>{{ historyMonthName() }} {{ historyYear() }}</h3>
              <button mat-icon-button (click)="nextHistoryMonth()" matTooltip="Next month" aria-label="Go to next month"><mat-icon>chevron_right</mat-icon></button>
              <button mat-stroked-button color="primary" (click)="goToHistoryToday()" class="history-today-btn">Today</button>
            </div>

            <div class="history-calendar-grid">
              <div class="history-weekday" *ngFor="let day of historyWeekdays">
                <strong>{{ day }}</strong>
              </div>
              @for (day of historyCalendarDays(); track day.date) {
                <div class="history-day"
                     [class.other-month]="!day.currentMonth"
                     [class.today]="day.isToday"
                     [class.has-verifications]="day.verifiedCount > 0"
                     [class.selected]="day.isSelected"
                     (click)="selectHistoryDate(day.date)"
                     [matTooltip]="day.verifiedCount > 0 ? day.verifiedCount + ' verified visitor' + (day.verifiedCount === 1 ? '' : 's') : ''">
                  <span class="history-day-number">{{ day.dayNumber }}</span>
                  @if (day.verifiedCount > 0) {
                    <span class="history-day-count">{{ day.verifiedCount }}</span>
                  }
                </div>
              }
            </div>
          </div>

          <div class="filter-bar">
            <mat-form-field appearance="outline">
              <mat-label>Search</mat-label>
              <input matInput [ngModel]="searchTerm()" (ngModelChange)="searchTerm.set($event)" placeholder="Visitor, badge, host...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Department</mat-label>
              <mat-select [ngModel]="filterDepartment()" (ngModelChange)="filterDepartment.set($event)">
                <mat-option value="">All</mat-option>
                @for (dept of departments(); track dept) {
                  <mat-option [value]="dept">{{ dept }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Host</mat-label>
              <mat-select [ngModel]="filterHost()" (ngModelChange)="filterHost.set($event)">
                <mat-option value="">All</mat-option>
                @for (host of hosts(); track host) {
                  <mat-option [value]="host">{{ host }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>

          @if (verifiedLoading()) {
            <div class="loading-row"><mat-spinner diameter="28"></mat-spinner></div>
          } @else if (filteredHistory().length) {
            <div class="verified-history-list">
              <div class="verified-history-title">
                @if (selectedHistoryDate()) {
                  <h3>{{ historySelectedLabel() }}</h3>
                } @else {
                  <h3>Verified Visitors - {{ historyMonthName() }} {{ historyYear() }}</h3>
                }
                <span class="verified-history-count">{{ filteredHistory().length }} verified</span>
              </div>
              @for (a of filteredHistory(); track a.id) {
                <div class="verified-card">
                  <div class="visitor-avatar">{{ (a.visitorName || '?').charAt(0) }}</div>
                  <div class="verified-card-main">
                    <strong>{{ a.visitorName }}</strong>
                    <p><mat-icon>badge</mat-icon> {{ a.badgeNumber || 'Not issued' }}</p>
                  </div>
                  <div class="verified-card-details">
                    <p><mat-icon>person</mat-icon> Host: {{ a.employeeName }}</p>
                    <p><mat-icon>domain</mat-icon> {{ a.departmentName }}</p>
                    <p><mat-icon>schedule</mat-icon> Verified: {{ verifiedAtLabel(a) }}</p>
                  </div>
                  <span class="ecx-status-badge" [ngClass]="statusOf(a).toLowerCase().replace(' ', '-')">{{ statusOf(a) }}</span>
                  <button mat-stroked-button color="primary" [routerLink]="['/appointments', a.id]" class="row-action">
                    <mat-icon>visibility</mat-icon> Details
                  </button>
                </div>
              }
            </div>
          } @else if (selectedHistoryDate()) {
            <div class="empty-state">
              <mat-icon>verified</mat-icon>
              <p>No verified visitors on this date</p>
            </div>
          } @else {
            <div class="empty-state">
              <mat-icon>history</mat-icon>
              <p>No verified visitors in {{ historyMonthName() }} {{ historyYear() }}</p>
            </div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styleUrls: ['./verify.component.scss']
})
export class VerifyComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  private snackBar = inject(MatSnackBar);

  pendingVerifications = signal<Appointment[]>([]);
  verifiedHistory = signal<Appointment[]>([]);
  pendingLoading = signal(false);
  verifiedLoading = signal(false);
  verifying = signal(false);

  selectedAppointment = signal<Appointment | null>(null);
  verificationRows = signal<VerificationRow[]>([]);
  verificationError = signal('');
  propertyTypes = ['Laptop', 'Desktop Computer', 'Monitor', 'Printer', 'Camera', 'Mobile Phone', 'Tablet', 'External Hard Drive', 'USB Flash Drive', 'Network Device', 'Other'];
  verificationStatuses: VerificationStatus[] = ['Verified', 'Missing', 'Additional Property', 'Rejected'];
  private nextRowKey = 1;

  searchTerm = signal('');
  filterDepartment = signal('');
  filterHost = signal('');

  historyWeekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  historyMonth = signal(new Date().getMonth());
  historyYear = signal(new Date().getFullYear());
  selectedHistoryDate = signal('');
  private monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  historyMonthName = computed(() => this.monthNames[this.historyMonth()]);

  historyCalendarDays = computed(() => {
    const firstDay = new Date(this.historyYear(), this.historyMonth(), 1);
    const lastDay = new Date(this.historyYear(), this.historyMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const counts = new Map<string, number>();
    for (const a of this.verifiedHistory()) {
      const d = this.verifyDate(a);
      if (d) counts.set(d, (counts.get(d) || 0) + 1);
    }

    const days: any[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      days.push({
        date: dateStr,
        dayNumber: d.getDate(),
        currentMonth: d.getMonth() === this.historyMonth(),
        isToday: dateStr === todayStr,
        isSelected: dateStr === this.selectedHistoryDate(),
        verifiedCount: counts.get(dateStr) || 0,
      });
      if (d > lastDay && d.getDay() === 6) break;
    }
    return days;
  });

  historySelectedLabel = computed(() => {
    const date = this.selectedHistoryDate();
    if (!date) return '';
    const d = new Date(date + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  });

  filteredHistory = computed(() => {
    let list = this.verifiedHistory();
    const selected = this.selectedHistoryDate();
    if (selected) {
      list = list.filter(a => this.verifyDate(a) === selected);
    } else {
      const monthPrefix = `${this.historyYear()}-${String(this.historyMonth() + 1).padStart(2, '0')}`;
      list = list.filter(a => this.verifyDate(a).startsWith(monthPrefix));
    }
    const term = this.searchTerm().trim().toLowerCase();
    if (term) {
      list = list.filter(a =>
        a.visitorName?.toLowerCase().includes(term) ||
        a.badgeNumber?.toLowerCase().includes(term) ||
        a.employeeName?.toLowerCase().includes(term)
      );
    }
    if (this.filterDepartment()) list = list.filter(a => a.departmentName === this.filterDepartment());
    if (this.filterHost()) list = list.filter(a => a.employeeName === this.filterHost());
    return [...list].sort((x, y) => this.verifyTime(y) - this.verifyTime(x));
  });

  verifiedToday = computed(() => this.verifiedHistory().filter(a => this.isVerifiedToday(a)).length);
  totalVerified = computed(() => this.verifiedHistory().length);
  rejectedCount = computed(() => this.verifiedHistory().filter(a => (a.properties || []).some(p => p.verificationStatus === 'Rejected')).length);

  departments = computed(() => [...new Set(this.verifiedHistory().map(a => a.departmentName).filter(Boolean))].sort());
  hosts = computed(() => [...new Set(this.verifiedHistory().map(a => a.employeeName).filter(Boolean))].sort());

  ngOnInit(): void {
    this.loadPendingVerifications();
    this.loadVerifiedHistory();
  }

  loadPendingVerifications(): void {
    this.pendingLoading.set(true);
    this.appointmentService.getPropertyVerifications().subscribe({
      next: (res) => {
        this.pendingLoading.set(false);
        if (res.success) this.pendingVerifications.set(res.data || []);
      },
      error: () => this.pendingLoading.set(false)
    });
  }

  loadVerifiedHistory(): void {
    this.verifiedLoading.set(true);
    this.appointmentService.getVerifiedPropertyVerifications().subscribe({
      next: (res) => {
        this.verifiedLoading.set(false);
        if (res.success) this.verifiedHistory.set(res.data || []);
      },
      error: () => this.verifiedLoading.set(false)
    });
  }

  propertySummary(apt: Appointment): string {
    const props = apt.properties || [];
    if (!props.length) return 'None';
    return props.map(p => {
      const name = p.propertyName || p.propertyType || 'Item';
      return p.quantity > 1 ? `${name} x${p.quantity}` : name;
    }).join(', ');
  }

  openVerification(apt: Appointment): void {
    this.selectedAppointment.set(apt);
    this.buildVerificationRows();
  }

  closeVerification(): void {
    this.selectedAppointment.set(null);
    this.verificationRows.set([]);
    this.verificationError.set('');
  }

  buildVerificationRows(): void {
    const apt = this.selectedAppointment();
    const rows: VerificationRow[] = (apt?.properties ?? []).map((p) => ({
      key: this.nextRowKey++,
      id: p.id,
      propertyType: p.propertyType || '',
      propertyName: p.propertyName || '',
      brand: p.brand || '',
      model: p.model || '',
      serialNumber: p.serialNumber || '',
      quantity: p.quantity > 0 ? p.quantity : 1,
      status: (p.verificationStatus as VerificationStatus) || 'Verified',
    }));
    this.verificationRows.set(rows);
    this.verificationError.set('');
  }

  addVerificationRow(): void {
    this.verificationRows.update((rows) => [
      ...rows,
      {
        key: this.nextRowKey++,
        propertyType: '',
        propertyName: '',
        brand: '',
        model: '',
        serialNumber: '',
        quantity: 1,
        status: 'Additional Property',
      },
    ]);
    this.verificationError.set('');
  }

  removeVerificationRow(index: number): void {
    this.verificationRows.update((rows) => rows.filter((_, i) => i !== index));
    this.verificationError.set('');
  }

  onVerificationTypeChange(row: VerificationRow): void {
    if (row.propertyType !== 'Other') {
      row.propertyName = '';
    }
    row.error = undefined;
  }

  saveVerification(): void {
    const apt = this.selectedAppointment();
    if (!apt) return;

    const rows = this.verificationRows();
    let firstError: string | null = null;
    const checked = rows.map((r) => {
      const row: VerificationRow = { ...r, error: undefined };
      if (!row.propertyType?.trim()) {
        row.error = 'Property Type is required for every property item.';
      } else if (row.propertyType === 'Other' && !row.propertyName?.trim()) {
        row.error = 'Property Name is required when Property Type is Other.';
      } else if (!row.quantity || row.quantity < 1) {
        row.error = 'Quantity must be greater than zero.';
      }
      if (row.error && !firstError) firstError = row.error;
      return row;
    });
    this.verificationRows.set(checked);
    this.verificationError.set(firstError ?? '');
    if (firstError) {
      this.snackBar.open(firstError, 'Close', { duration: 4000 });
      return;
    }

    this.verifying.set(true);
    const items: PropertyVerificationItem[] = rows.map((r) => ({
      id: r.id,
      propertyType: r.propertyType.trim(),
      propertyName: r.propertyName.trim() || undefined,
      brand: r.brand.trim() || undefined,
      model: r.model.trim() || undefined,
      serialNumber: r.serialNumber.trim() || undefined,
      quantity: r.quantity,
      verificationStatus: r.status,
    }));
    this.appointmentService.savePropertyVerification(apt.id, items).subscribe({
      next: (res) => {
        this.verifying.set(false);
        if (res.success) {
          this.snackBar.open('Verification saved. Visitor checked in and is now active.', 'Close', { duration: 4000 });
          this.pendingVerifications.update(list => list.filter(a => a.id !== apt.id));
          this.loadVerifiedHistory();
          this.closeVerification();
        }
      },
      error: (err) => {
        this.verifying.set(false);
        this.snackBar.open(err.error?.message || 'Failed to save verification', 'Close', { duration: 3000 });
      }
    });
  }

  private verifyTime(a: Appointment): number {
    const times = (a.properties || []).map(p => p.verifiedAt ? new Date(p.verifiedAt).getTime() : 0);
    return Math.max(0, ...times);
  }

  private verifyDate(a: Appointment): string {
    const at = this.latestVerifiedProperty(a)?.verifiedAt;
    if (!at) return '';
    const d = new Date(at);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  prevHistoryMonth(): void {
    if (this.historyMonth() === 0) { this.historyMonth.set(11); this.historyYear.update(y => y - 1); }
    else { this.historyMonth.update(m => m - 1); }
  }

  nextHistoryMonth(): void {
    if (this.historyMonth() === 11) { this.historyMonth.set(0); this.historyYear.update(y => y + 1); }
    else { this.historyMonth.update(m => m + 1); }
  }

  goToHistoryToday(): void {
    const today = new Date();
    this.historyMonth.set(today.getMonth());
    this.historyYear.set(today.getFullYear());
    this.selectedHistoryDate.set(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`);
  }

  selectHistoryDate(date: string): void {
    this.selectedHistoryDate.set(this.selectedHistoryDate() === date ? '' : date);
  }

  private isVerifiedToday(a: Appointment): boolean {
    const today = new Date();
    return (a.properties || []).some(p => {
      if (!p.verifiedAt) return false;
      const d = new Date(p.verifiedAt);
      return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
    });
  }

  private latestVerifiedProperty(a: Appointment): AppointmentProperty | undefined {
    return (a.properties || [])
      .filter(p => p.isVerified)
      .sort((x, y) => (new Date(y.verifiedAt || 0).getTime()) - (new Date(x.verifiedAt || 0).getTime()))[0];
  }

  verifiedByLabel(a: Appointment): string {
    return this.latestVerifiedProperty(a)?.verifiedByUserName || '-';
  }

  verifiedAtLabel(a: Appointment): string {
    const at = this.latestVerifiedProperty(a)?.verifiedAt;
    return at ? new Date(at).toLocaleString() : '-';
  }

  statusOf(a: Appointment): string {
    const props = a.properties || [];
    if (props.some(p => p.verificationStatus === 'Rejected')) return 'Rejected';
    if (props.some(p => p.verificationStatus === 'Missing')) return 'Missing';
    return 'Verified';
  }
}
