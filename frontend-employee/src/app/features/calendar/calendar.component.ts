import { Component, OnInit, inject, signal } from '@angular/core';
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
        <button mat-raised-button color="warn" (click)="showMarkUnavailable = !showMarkUnavailable">
          <mat-icon>event_busy</mat-icon> Mark Unavailable
        </button>
      </div>

      @if (showMarkUnavailable) {
        <mat-card class="unavailability-form">
          <mat-card-header>
            <mat-card-title>Mark Unavailable Period</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Type</mat-label>
                <mat-select [(ngModel)]="unavailType">
                  <mat-option value="AnnualLeave">Annual Leave</mat-option>
                  <mat-option value="MedicalLeave">Medical Leave</mat-option>
                  <mat-option value="BusinessTravel">Business Travel</mat-option>
                  <mat-option value="Other">Other</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Start Date</mat-label>
                <input matInput [type]="'date'" [(ngModel)]="unavailStartDate">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>End Date (optional)</mat-label>
                <input matInput [type]="'date'" [(ngModel)]="unavailEndDate">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Reason (optional)</mat-label>
                <input matInput [(ngModel)]="unavailReason" placeholder="Reason for unavailability">
              </mat-form-field>
            </div>
            <div class="form-actions">
              <button mat-stroked-button (click)="showMarkUnavailable = false">Cancel</button>
              <button mat-raised-button color="primary" (click)="markUnavailable()" [disabled]="!unavailStartDate">
                <mat-icon>save</mat-icon> Save
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      }

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
                  <strong>{{ u.unavailabilityType }}</strong>
                  <p>{{ u.startDate }} {{ u.endDate ? 'to ' + u.endDate : '' }}</p>
                  @if (u.reason) { <small>{{ u.reason }}</small> }
                </div>
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
            <div class="calendar-day" [class.other-month]="!day.currentMonth" [class.today]="day.isToday"
                 [class.unavailable]="day.isUnavailable">
              <span class="day-number">{{ day.dayNumber }}</span>
              @if (day.isUnavailable) {
                <div class="unavail-badge" [title]="day.unavailReason || 'Unavailable'">
                  <mat-icon>event_busy</mat-icon>
                </div>
              }
              @for (event of day.events; track event.id) {
                <div class="event-dot" [style.background]="event.status === 'Approved' ? '#2e7d32' : event.status === 'Pending' ? '#f9a825' : '#666'"
                     [title]="event.purpose + ' - ' + event.visitorName">
                   <small>{{ event.requestedStartTime }} {{ event.visitorName }}</small>
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
              <div class="event-item">
                <div class="event-time">{{ event.requestedStartTime }}</div>
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
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #2e7d32; }
    .page-header h1 { font-size: 24px; font-weight: 500; color: #1b5e20; }
    .unavailability-form { margin-bottom: 16px; }
    .form-row { display: flex; gap: 16px; flex-wrap: wrap; }
    .form-row mat-form-field { flex: 1; min-width: 180px; }
    .form-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 8px; }
    .unavailability-list { margin-bottom: 16px; }
    .unavail-item { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
    .unavail-item:last-child { border-bottom: none; }
    .unavail-icon { width: 40px; height: 40px; border-radius: 8px; background: #ffebee; color: #c62828; display: flex; align-items: center; justify-content: center; }
    .unavail-info { flex: 1; }
    .unavail-info strong { font-size: 14px; display: block; }
    .unavail-info p { font-size: 12px; color: #666; margin: 2px 0; }
    .unavail-info small { font-size: 11px; color: #999; }
    .calendar-header { display: flex; align-items: center; justify-content: center; gap: 16px; padding: 16px; }
    .calendar-header h2 { margin: 0; font-size: 20px; }
    .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); border-top: 1px solid #e0e0e0; }
    .weekday-header { padding: 8px; text-align: center; background: #f5f5f5; border-bottom: 1px solid #e0e0e0; }
    .weekday-header strong { font-size: 12px; color: #666; text-transform: uppercase; }
    .calendar-day {
      min-height: 100px; padding: 8px; border: 1px solid #e0e0e0;
      cursor: pointer; transition: background 0.2s;
    }
    .calendar-day:hover { background: #f5f5f5; }
    .calendar-day.other-month { background: #fafafa; }
    .calendar-day.other-month .day-number { color: #bbb; }
    .calendar-day.today { background: #e8f5e9; }
    .calendar-day.today .day-number { color: #2e7d32; font-weight: 700; }
    .calendar-day.unavailable { background: #fff3e0; }
    .calendar-day.unavailable .day-number { color: #e65100; }
    .day-number { font-size: 14px; display: block; margin-bottom: 4px; }
    .unavail-badge { color: #c62828; }
    .unavail-badge mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .event-dot {
      background: #2e7d32; color: white; padding: 2px 6px; border-radius: 4px;
      font-size: 10px; margin-bottom: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .event-dot small { color: white; }
    .events-panel { margin-top: 16px; }
    .event-item { display: flex; align-items: center; gap: 16px; padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
    .event-item:last-child { border-bottom: none; }
    .event-time { font-weight: 600; color: #1a237e; min-width: 60px; }
    .event-info { flex: 1; }
    .event-info strong { font-size: 14px; display: block; }
    .event-info p { font-size: 12px; color: #666; margin: 2px 0; }
  `]
})
export class CalendarComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  private unavailabilityService = inject(UnavailabilityService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  currentMonth = signal(new Date().getMonth());
  year = signal(new Date().getFullYear());
  calendarDays = signal<any[]>([]);
  appointments = signal<Appointment[]>([]);
  unavailabilities = signal<EmployeeUnavailability[]>([]);
  selectedDayEvents = signal<Appointment[]>([]);
  selectedDayLabel = signal('');

  showMarkUnavailable = false;
  unavailType = 'Other';
  unavailStartDate = '';
  unavailEndDate = '';
  unavailReason = '';

  monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  monthName = signal(this.monthNames[this.currentMonth()]);

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
      const dateOnly = dateStr;

      const unavail = this.unavailabilities().find(u => {
        const start = u.startDate;
        const end = u.endDate || u.startDate;
        return dateOnly >= start && dateOnly <= end;
      });

      days.push({
        date: dateStr,
        dayNumber: d.getDate(),
        currentMonth: d.getMonth() === this.currentMonth(),
        isToday: dateStr === todayStr,
        isUnavailable: !!unavail,
        unavailReason: unavail?.reason || unavail?.unavailabilityType || '',
        events: this.appointments().filter(a => a.requestedDate === dateStr)
      });
      if (d > lastDay && d.getDay() === 6) break;
    }
    this.calendarDays.set(days);
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
  }

  markUnavailable(): void {
    const user = this.authService.getCurrentUser();
    if (!user?.employeeId || !this.unavailStartDate) return;

    this.unavailabilityService.create({
      employeeId: user.employeeId,
      unavailabilityType: this.unavailType,
      startDate: this.unavailStartDate,
      endDate: this.unavailEndDate || undefined,
      reason: this.unavailReason || undefined
    }).subscribe({
      next: () => {
        this.snackBar.open('Unavailability period saved', 'Close', { duration: 3000 });
        this.showMarkUnavailable = false;
        this.unavailStartDate = '';
        this.unavailEndDate = '';
        this.unavailReason = '';
        this.loadUnavailabilities();
      },
      error: () => {
        this.snackBar.open('Failed to save unavailability', 'Close', { duration: 3000 });
      }
    });
  }

  deleteUnavailability(id: number): void {
    this.unavailabilityService.delete(id).subscribe({
      next: () => {
        this.snackBar.open('Unavailability period removed', 'Close', { duration: 3000 });
        this.loadUnavailabilities();
      }
    });
  }
}
