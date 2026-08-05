import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AppointmentService } from '../../core/services/appointment.service';
import { UnavailabilityService } from '../../core/services/unavailability.service';
import { AuthService } from '../../core/services/auth.service';
import { Appointment } from '../../core/models/appointment.model';
import { EmployeeUnavailability } from '../../core/models/unavailability.model';
import { UnavailabilityDialogComponent } from './dialogs/unavailability-dialog/unavailability-dialog.component';
import { AppointmentDetailsDialogComponent } from './dialogs/appointment-details-dialog/appointment-details-dialog.component';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatButtonModule, MatIconModule, MatCardModule,
    MatTooltipModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatDialogModule, MatSnackBarModule
  ],
  template: `
    <div class="calendar-page">
      <div class="page-header">
        <h1>Calendar</h1>
        <button mat-raised-button color="primary" (click)="openUnavailabilityDialog()">
          <mat-icon>event_busy</mat-icon> Add Unavailability
        </button>
      </div>

      @if (unavailabilities().length) {
        <mat-card class="unavailability-list">
          <mat-card-header>
            <mat-card-title>Upcoming Unavailable Periods</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            @for (u of unavailabilities(); track u.id) {
              <div class="unavail-item">
                <div class="unavail-icon"><mat-icon>event_busy</mat-icon></div>
                <div class="unavail-info">
                  <strong>{{ unavailabilityLabel(u) }}</strong>
                  <p>{{ dateRange(u) }}{{ timeRange(u) }}{{ u.repeat && u.repeat !== 'None' ? ' · Repeats ' + u.repeat : '' }}</p>
                  @if (u.reason) { <small>{{ u.reason }}</small> }
                </div>
                <button mat-icon-button color="primary" (click)="openUnavailabilityDialog(u)" matTooltip="Edit" aria-label="Edit unavailability period">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deleteUnavailability(u.id)" matTooltip="Remove" aria-label="Remove unavailability period">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            }
          </mat-card-content>
        </mat-card>
      }

      <mat-card>
        <div class="calendar-header">
          <button mat-icon-button (click)="prevMonth()" matTooltip="Previous month" aria-label="Go to previous month"><mat-icon>chevron_left</mat-icon></button>
          <h2>{{ monthName() }} {{ year() }}</h2>
          <button mat-icon-button (click)="nextMonth()" matTooltip="Next month" aria-label="Go to next month"><mat-icon>chevron_right</mat-icon></button>
          <button mat-stroked-button color="primary" (click)="goToToday()" style="margin-left: auto;">Today</button>
        </div>

        <div class="calendar-grid">
          <div class="weekday-header" *ngFor="let day of weekdays">
            <strong>{{ day }}</strong>
          </div>
          @for (day of calendarDays(); track day.date) {
            <div class="calendar-day"
                 [class.other-month]="!day.currentMonth"
                 [class.today]="day.isToday"
                 [class.unavailable]="day.isUnavailable"
                 [class.selected]="day.date === selectedDate()"
                 (click)="onDayClick(day)"
                 [matTooltip]="day.isUnavailable ? unavailableTooltip(day) : ''">
              <span class="day-number">{{ day.dayNumber }}</span>
              @if (day.isUnavailable) {
                <div class="unavail-badge">
                  <mat-icon>event_busy</mat-icon>
                </div>
              }
              @for (event of day.events; track event.id) {
                <div class="event-chip"
                     [style.background]="statusColor(event.status)"
                     (click)="openAppointmentDialog(event, $event)"
                     [matTooltip]="event.purpose + ' - ' + event.visitorName">
                   <small>{{ formatTime(event.requestedStartTime) }} · {{ event.visitorName }}</small>
                </div>
              }
            </div>
          }
        </div>
      </mat-card>

      @if (selectedDayEvents().length) {
        <mat-card class="events-panel">
          <mat-card-header>
            <mat-card-title>{{ selectedDayLabel() }} - Appointments</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            @for (event of selectedDayEvents(); track event.id) {
              <div class="event-item" (click)="openAppointmentDialog(event, $event)">
                <div class="event-time">{{ formatTime(event.requestedStartTime) }} - {{ formatTime(event.requestedEndTime) }}</div>
                <div class="event-info">
                  <strong>{{ event.purpose }}</strong>
                  <p>Visitor: {{ event.visitorName }} | Host: {{ event.employeeName }}</p>
                </div>
                <span class="ecx-status-badge" [ngClass]="event.status.toLowerCase()">{{ event.status }}</span>
              </div>
            }
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  private unavailabilityService = inject(UnavailabilityService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  currentMonth = signal(new Date().getMonth());
  year = signal(new Date().getFullYear());
  calendarDays = signal<any[]>([]);
  appointments = signal<Appointment[]>([]);
  unavailabilities = signal<EmployeeUnavailability[]>([]);
  selectedDate = signal('');

  monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  monthName = signal(this.monthNames[this.currentMonth()]);

  selectedDayEvents = computed(() =>
    this.appointments().filter(a => a.requestedDate === this.selectedDate())
  );
  selectedDayLabel = computed(() => {
    const date = this.selectedDate();
    if (!date) return '';
    const d = new Date(date + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  });

  private reasonLabels: Record<string, string> = {
    AnnualLeave: 'Annual Leave',
    SickLeave: 'Sick Leave',
    Meeting: 'Meeting',
    BusinessTravel: 'Business Travel',
    Training: 'Training',
    Personal: 'Personal',
    Other: 'Other'
  };

  ngOnInit(): void { this.loadCalendar(); this.loadUnavailabilities(); }

  loadCalendar(): void {
    this.monthName.set(this.monthNames[this.currentMonth()]);
    this.appointmentService.getAll({ page: 1, limit: 100 }).subscribe({
      next: (res: any) => {
        if (res.success) this.appointments.set(res.data?.items || []);
        this.buildCalendar();
      },
      error: () => { this.buildCalendar(); }
    });
  }

  loadUnavailabilities(): void {
    const user = this.authService.getCurrentUser();
    if (user?.employeeId) {
      this.unavailabilityService.getAll(user.employeeId).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.unavailabilities.set(res.data);
            this.buildCalendar();
          }
        }
      });
    }
  }

  buildCalendar(): void {
    const firstDay = new Date(this.year(), this.currentMonth(), 1);
    const lastDay = new Date(this.year(), this.currentMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: any[] = [];
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    for (let i = 0; i < 42; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

      const unavail = this.unavailabilities().find(u => {
        const start = u.startDate;
        const end = u.endDate || u.startDate;
        return dateStr >= start && dateStr <= end;
      });

      days.push({
        date: dateStr,
        dayNumber: d.getDate(),
        currentMonth: d.getMonth() === this.currentMonth(),
        isToday: dateStr === todayStr,
        isUnavailable: !!unavail,
        unavail: unavail ?? null,
        events: this.appointments()
          .filter(a => a.requestedDate === dateStr)
          .sort((a, b) => a.requestedStartTime.localeCompare(b.requestedStartTime))
      });
      if (d > lastDay && d.getDay() === 6) break;
    }
    this.calendarDays.set(days);
  }

  onDayClick(day: any): void {
    this.selectedDate.set(day.date);
  }

  openUnavailabilityDialog(record?: EmployeeUnavailability): void {
    const user = this.authService.getCurrentUser();
    const dialogRef = this.dialog.open(UnavailabilityDialogComponent, {
      width: '520px',
      data: { record }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      const payload = { ...result, employeeId: record ? record.employeeId : (user?.employeeId ?? 0) };
      const request = record
        ? this.unavailabilityService.update(record.id, payload)
        : this.unavailabilityService.create(payload);
      request.subscribe({
        next: (res) => {
          if (res.success) {
            this.snackBar.open(record ? 'Unavailability period updated' : 'Unavailability period saved', 'Close', { duration: 3000 });
            this.loadUnavailabilities();
            this.loadCalendar();
          }
        },
        error: () => this.snackBar.open('Failed to save unavailability period', 'Close', { duration: 3000 })
      });
    });
  }

  deleteUnavailability(id: number): void {
    this.unavailabilityService.delete(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.snackBar.open('Unavailability period removed', 'Close', { duration: 3000 });
          this.loadUnavailabilities();
          this.loadCalendar();
        }
      },
      error: () => this.snackBar.open('Failed to remove unavailability period', 'Close', { duration: 3000 })
    });
  }

  openAppointmentDialog(event: Appointment, $event?: MouseEvent): void {
    if ($event) $event.stopPropagation();
    this.selectedDate.set(event.requestedDate);
    const dialogRef = this.dialog.open(AppointmentDetailsDialogComponent, {
      width: '680px',
      data: { appointment: event }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.changed) this.loadCalendar();
    });
  }

  prevMonth(): void {
    if (this.currentMonth() === 0) { this.currentMonth.set(11); this.year.update(y => y - 1); }
    else { this.currentMonth.update(m => m - 1); }
    this.loadCalendar();
  }

  nextMonth(): void {
    if (this.currentMonth() === 11) { this.currentMonth.set(0); this.year.update(y => y + 1); }
    else { this.currentMonth.update(m => m + 1); }
    this.loadCalendar();
  }

  goToToday(): void {
    const today = new Date();
    this.currentMonth.set(today.getMonth());
    this.year.set(today.getFullYear());
    this.loadCalendar();
    this.selectedDate.set(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`);
  }

  statusColor(status: string): string {
    switch (status) {
      case 'Approved': return '#0F6B3A';
      case 'Pending': return '#D4A017';
      case 'Rejected': return '#DC3545';
      case 'Completed': return '#1565c0';
      case 'Cancelled': return '#6B7280';
      case 'EmployeeUnavailable': return '#7b1fa2';
      default: return '#0F6B3A';
    }
  }

  unavailabilityLabel(u: EmployeeUnavailability): string {
    return this.reasonLabels[u.unavailabilityType] || u.unavailabilityType || 'Unavailable';
  }

  dateRange(u: EmployeeUnavailability): string {
    return u.endDate && u.endDate !== u.startDate
      ? `${u.startDate} to ${u.endDate}`
      : u.startDate;
  }

  timeRange(u: EmployeeUnavailability): string {
    if (!u.startTime && !u.endTime) return '';
    if (u.startTime && u.endTime) return ` | ${this.formatTime12h(u.startTime)} - ${this.formatTime12h(u.endTime)}`;
    return ` | ${u.startTime || ''}${u.endTime ? ' - ' + u.endTime : ''}`.trim();
  }

  unavailableTooltip(day: any): string {
    const u: EmployeeUnavailability = day.unavail;
    if (!u) return '';
    const label = this.unavailabilityLabel(u);
    const range = this.dateRange(u);
    const time = u.startTime && u.endTime ? ` | ${this.formatTime12h(u.startTime)} - ${this.formatTime12h(u.endTime)}` : '';
    return `Unavailable: ${label} | ${range}${time}`;
  }

  formatTime(value: string): string {
    if (!value) return '';
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return this.formatTime12h(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
  }

  formatTime12h(time: string): string {
    const m = String(time || '').match(/^(\d{1,2}):(\d{2})/);
    if (!m) return time;
    let hours = parseInt(m[1], 10);
    const minutes = m[2];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  }
}
