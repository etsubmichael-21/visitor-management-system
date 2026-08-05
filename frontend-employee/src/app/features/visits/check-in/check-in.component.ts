import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { VisitService } from '../../../core/services/visit.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { DepartmentService } from '../../../core/services/department.service';
import { Appointment } from '../../../core/models/appointment.model';
import { Employee } from '../../../core/models/employee.model';
import { Department } from '../../../core/models/common.model';

@Component({
  selector: 'app-check-in',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSelectModule,
    MatCheckboxModule, MatAutocompleteModule, MatButtonToggleModule,
    MatProgressSpinnerModule, MatSnackBarModule
  ],
  template: `
    <div class="check-in">
      <div class="page-header">
        <h1>Visitor Check-In</h1>
      </div>

      <mat-card class="main-card">
        <mat-card-content>
          <div class="checkin-options">
            <mat-button-toggle-group [(ngModel)]="checkInMode" (ngModelChange)="onModeChange()">
              <mat-button-toggle value="appointment">With Appointment</mat-button-toggle>
              <mat-button-toggle value="walkin">Walk-In</mat-button-toggle>
            </mat-button-toggle-group>
          </div>

          @if (checkInMode === 'appointment') {
            <div class="appointment-search">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Search Appointment</mat-label>
                <input matInput [(ngModel)]="appointmentSearch" [matAutocomplete]="aptAuto"
                       (input)="searchAppointments()" placeholder="Search by visitor name or host...">
                <mat-autocomplete #aptAuto="matAutocomplete" (optionSelected)="selectAppointment($event)">
                  @for (apt of matchedAppointments(); track apt.id) {
                    <mat-option [value]="apt.id">
                      {{ apt.visitorName }} - {{ apt.requestedStartTime }} with {{ apt.employeeName }}
                    </mat-option>
                  }
                </mat-autocomplete>
              </mat-form-field>

              @if (selectedAppointment()) {
                <div class="selected-appointment">
                  <div class="apt-info">
                    <h3>{{ selectedAppointment()!.purpose }}</h3>
                    <p><strong>Visitor:</strong> {{ selectedAppointment()!.visitorName }}</p>
                    <p><strong>Time:</strong> {{ selectedAppointment()!.requestedStartTime }} - {{ selectedAppointment()!.requestedEndTime }}</p>
                    <p><strong>Host:</strong> {{ selectedAppointment()!.employeeName }}</p>
                    <p><strong>Purpose:</strong> {{ selectedAppointment()!.purpose }}</p>
                  </div>
                  @if (selectedAppointment()!.hasProperties) {
                    <div class="apt-property-banner" [class.warn]="!selectedAppointment()!.allPropertiesVerified" [class.ok]="selectedAppointment()!.allPropertiesVerified">
                      <mat-icon>{{ selectedAppointment()!.allPropertiesVerified ? 'verified' : 'warning' }}</mat-icon>
                      <div>
                        <strong>{{ selectedAppointment()!.allPropertiesVerified ? 'Property Verified' : 'Unverified Property Items' }}</strong>
                        <span *ngIf="!selectedAppointment()!.allPropertiesVerified">
                          This visitor registered {{ selectedAppointment()!.properties!.length }} property item(s). Security must verify them before check-in.
                        </span>
                        <span *ngIf="selectedAppointment()!.allPropertiesVerified">
                          All registered property items have been verified by Security.
                        </span>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <h3 class="section-title">Visitor Information</h3>
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Full Name</mat-label>
                <input matInput formControlName="visitorName">
                @if (form.get('visitorName')?.hasError('required') && form.get('visitorName')?.touched) {
                  <mat-error>Name is required</mat-error>
                }
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>ID Number</mat-label>
                <input matInput formControlName="visitorIdNumber">
                @if (form.get('visitorIdNumber')?.hasError('required') && form.get('visitorIdNumber')?.touched) {
                  <mat-error>ID Number is required</mat-error>
                }
              </mat-form-field>
            </div>
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Email</mat-label>
                <input matInput formControlName="visitorEmail" type="email">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Phone</mat-label>
                <input matInput formControlName="visitorPhone">
              </mat-form-field>
            </div>
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Company</mat-label>
                <input matInput formControlName="visitorCompany">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Host Employee</mat-label>
                <mat-select formControlName="hostEmployeeId">
                  @for (emp of employees(); track emp.id) {
                    <mat-option [value]="emp.id">{{ emp.fullName }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Department</mat-label>
                <mat-select formControlName="departmentId">
                  @for (dept of departments(); track dept.id) {
                    <mat-option [value]="dept.id">{{ dept.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Purpose</mat-label>
                <input matInput formControlName="purpose">
              </mat-form-field>
            </div>

            <h3 class="section-title">Building Access</h3>
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Badge Number</mat-label>
                <input matInput formControlName="badgeNumber">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Parking Spot</mat-label>
                <input matInput formControlName="parkingSpot">
              </mat-form-field>
            </div>
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Floor</mat-label>
                <input matInput formControlName="floor">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Room</mat-label>
                <input matInput formControlName="room">
              </mat-form-field>
            </div>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Items Carried</mat-label>
              <input matInput formControlName="itemsCarried" placeholder="List any items brought in">
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Notes</mat-label>
              <textarea matInput formControlName="notes" rows="2"></textarea>
            </mat-form-field>

            <div class="form-actions">
              <button mat-stroked-button type="button" routerLink="/reception/dashboard">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="isLoading() || form.invalid">
                @if (isLoading()) { <mat-spinner diameter="20"></mat-spinner> }
                <mat-icon>how_to_reg</mat-icon> Check In Visitor
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styleUrls: ['./check-in.component.scss']
})
export class CheckInComponent implements OnInit {
  private fb = inject(FormBuilder);
  private visitService = inject(VisitService);
  private appointmentService = inject(AppointmentService);
  private employeeService = inject(EmployeeService);
  private departmentService = inject(DepartmentService);
  private snackBar = inject(MatSnackBar);

  form!: FormGroup;
  employees = signal<Employee[]>([]);
  departments = signal<Department[]>([]);
  matchedAppointments = signal<Appointment[]>([]);
  selectedAppointment = signal<Appointment | null>(null);
  isLoading = signal(false);
  checkInMode = 'walkin';
  appointmentSearch = '';

  ngOnInit(): void {
    this.form = this.fb.group({
      visitorName: ['', Validators.required],
      visitorIdNumber: ['', Validators.required],
      visitorEmail: [''],
      visitorPhone: [''],
      visitorCompany: [''],
      hostEmployeeId: ['', Validators.required],
      departmentId: ['', Validators.required],
      purpose: ['', Validators.required],
      badgeNumber: [''],
      parkingSpot: [''],
      floor: [''],
      room: [''],
      itemsCarried: [''],
      notes: ['']
    });

    this.employeeService.getAll({ limit: 200 }).subscribe({
      next: (res) => { if (res.success && res.data) this.employees.set(res.data.items || []); }
    });
    this.departmentService.getAll().subscribe({
      next: (res) => { if (res.success) this.departments.set(res.data || []); }
    });
  }

  onModeChange(): void {
    this.selectedAppointment.set(null);
    this.appointmentSearch = '';
  }

  searchAppointments(): void {
    if (this.appointmentSearch.length < 2) { this.matchedAppointments.set([]); return; }
    this.appointmentService.getAll({ search: this.appointmentSearch, status: 'Approved', limit: 10 }).subscribe({
      next: (res) => { if (res.success && res.data) this.matchedAppointments.set(res.data.items || []); }
    });
  }

  selectAppointment(event: any): void {
    const aptId = event.option.value;
    const apt = this.matchedAppointments().find(a => a.id === aptId);
    if (apt) {
      this.selectedAppointment.set(apt);
      this.form.patchValue({
        visitorName: apt.visitorName,
        visitorEmail: apt.visitorEmail,
        visitorPhone: apt.visitorPhone,
        hostEmployeeId: apt.employeeId,
        purpose: apt.purpose
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isLoading.set(true);
    const request: any = { ...this.form.value };
    if (this.selectedAppointment()) request.appointmentId = this.selectedAppointment()!.id;

    this.visitService.checkIn(request).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success) {
          this.snackBar.open('Visitor checked in successfully', 'Close', { duration: 3000 });
          this.form.reset();
          this.selectedAppointment.set(null);
        }
      },
      error: (err) => { this.isLoading.set(false); this.snackBar.open(err.error?.message || 'Check-in failed', 'Close', { duration: 3000 }); }
    });
  }
}
