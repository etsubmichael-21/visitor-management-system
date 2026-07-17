import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserService } from '../../../core/services/user.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { DepartmentService } from '../../../core/services/department.service';
import { Employee } from '../../../core/models/employee.model';
import { Department } from '../../../core/models/common.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSelectModule,
    MatProgressSpinnerModule, MatSnackBarModule
  ],
  template: `
    <div class="user-form">
      <div class="page-header">
        <h1>Create New User</h1>
        <a mat-stroked-button color="primary" routerLink="/admin/users">
          <mat-icon>arrow_back</mat-icon> Back
        </a>
      </div>

      <mat-card>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Full Name</mat-label>
                <input matInput formControlName="fullName">
                @if (form.get('fullName')?.hasError('required') && form.get('fullName')?.touched) {
                  <mat-error>Required</mat-error>
                }
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Email</mat-label>
                <input matInput formControlName="email" type="email">
                @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
                  <mat-error>Required</mat-error>
                }
                @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
                  <mat-error>Invalid email</mat-error>
                }
              </mat-form-field>
            </div>
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Password</mat-label>
                <input matInput formControlName="password" [type]="hidePass() ? 'password' : 'text'">
                <button mat-icon-button matSuffix type="button" (click)="hidePass.set(!hidePass())">
                  <mat-icon>{{ hidePass() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                @if (form.get('password')?.hasError('required') && form.get('password')?.touched) {
                  <mat-error>Required</mat-error>
                }
                @if (form.get('password')?.hasError('minlength') && form.get('password')?.touched) {
                  <mat-error>Min 6 characters</mat-error>
                }
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Role</mat-label>
                <mat-select formControlName="role">
                  <mat-option value="Admin">Admin</mat-option>
                  <mat-option value="CEO">CEO</mat-option>
                  <mat-option value="DepartmentHead">Department Head</mat-option>
                  <mat-option value="Employee">Employee</mat-option>
                  <mat-option value="Receptionist">Receptionist</mat-option>
                  <mat-option value="Security">Security</mat-option>
                </mat-select>
                @if (form.get('role')?.hasError('required') && form.get('role')?.touched) {
                  <mat-error>Required</mat-error>
                }
              </mat-form-field>
            </div>
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Link to Employee</mat-label>
                <mat-select formControlName="employeeId">
                  @for (emp of employees(); track emp.id) {
                    <mat-option [value]="emp.id">{{ emp.fullName }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>
            <div class="form-actions">
              <button mat-stroked-button type="button" routerLink="/admin/users">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="isLoading() || form.invalid">
                @if (isLoading()) { <mat-spinner diameter="20"></mat-spinner> }
                <mat-icon>person_add</mat-icon> Create User
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #2e7d32; }
    .page-header h1 { font-size: 24px; font-weight: 500; color: #1b5e20; }
    .page-header a { display: flex; align-items: center; gap: 4px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 8px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e0e0e0; }
    .form-actions button { display: flex; align-items: center; gap: 8px; }
    @media (max-width: 768px) { .form-row { grid-template-columns: 1fr; } }
  `]
})
export class UserFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private employeeService = inject(EmployeeService);
  private departmentService = inject(DepartmentService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  form!: FormGroup;
  employees = signal<Employee[]>([]);
  departments = signal<Department[]>([]);
  isLoading = signal(false);
  hidePass = signal(true);

  ngOnInit(): void {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['', Validators.required],
      employeeId: [null]
    });

    this.employeeService.getAll({ limit: 200 }).subscribe({
      next: (res) => { if (res.success && res.data) this.employees.set(res.data.items || []); }
    });
    this.departmentService.getAll().subscribe({
      next: (res) => { if (res.success) this.departments.set(res.data || []); }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isLoading.set(true);
    this.userService.create(this.form.value).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success) {
          this.snackBar.open('User created successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/admin/users']);
        }
      },
      error: (err) => { this.isLoading.set(false); this.snackBar.open(err.error?.message || 'Failed', 'Close', { duration: 3000 }); }
    });
  }
}
