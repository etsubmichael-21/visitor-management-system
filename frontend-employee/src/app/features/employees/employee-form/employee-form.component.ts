import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EmployeeService } from '../../../core/services/employee.service';
import { DepartmentService } from '../../../core/services/department.service';
import { Department } from '../../../core/models/common.model';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSelectModule,
    MatCheckboxModule, MatProgressSpinnerModule, MatSnackBarModule
  ],
  template: `
    <div class="employee-form">
      <div class="page-header">
        <h1>{{ isEditMode() ? 'Edit Employee' : 'Add New Employee' }}</h1>
        <a mat-stroked-button color="primary" routerLink="/admin/employees">
          <mat-icon>arrow_back</mat-icon> Back to List
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
                  <mat-error>Full name is required</mat-error>
                }
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Email</mat-label>
                <input matInput formControlName="email" type="email">
                @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
                  <mat-error>Email is required</mat-error>
                }
                @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
                  <mat-error>Invalid email format</mat-error>
                }
              </mat-form-field>
            </div>
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Phone</mat-label>
                <input matInput formControlName="phone">
                @if (form.get('phone')?.hasError('required') && form.get('phone')?.touched) {
                  <mat-error>Phone is required</mat-error>
                }
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Department</mat-label>
                <mat-select formControlName="departmentId">
                  @for (dept of departments(); track dept.id) {
                    <mat-option [value]="dept.id">{{ dept.name }}</mat-option>
                  }
                </mat-select>
                @if (form.get('departmentId')?.hasError('required') && form.get('departmentId')?.touched) {
                  <mat-error>Department is required</mat-error>
                }
              </mat-form-field>
            </div>
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Position</mat-label>
                <input matInput formControlName="position">
                @if (form.get('position')?.hasError('required') && form.get('position')?.touched) {
                  <mat-error>Position is required</mat-error>
                }
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Office Number</mat-label>
                <input matInput formControlName="officeNumber">
              </mat-form-field>
            </div>
            <div class="form-actions">
              <button mat-stroked-button type="button" routerLink="/admin/employees">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="isLoading() || form.invalid">
                @if (isLoading()) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  <mat-icon>save</mat-icon>
                  {{ isEditMode() ? 'Update' : 'Create' }} Employee
                }
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
    .page-header a { display: flex; align-items: center; gap: 8px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 8px; }
    .checkbox-field { display: flex; align-items: center; padding-top: 8px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e0e0e0; }
    .form-actions button { display: flex; align-items: center; gap: 8px; }
    @media (max-width: 768px) { .form-row { grid-template-columns: 1fr; } }
  `]
})
export class EmployeeFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private employeeService = inject(EmployeeService);
  private departmentService = inject(DepartmentService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  form!: FormGroup;
  departments = signal<Department[]>([]);
  isEditMode = signal(false);
  isLoading = signal(false);
  employeeId = signal<number | null>(null);

  ngOnInit(): void {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      departmentId: ['', Validators.required],
      position: ['', Validators.required],
      officeNumber: ['']
    });

    this.departmentService.getAll().subscribe({
      next: (res) => { if (res.success) this.departments.set(res.data || []); }
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.employeeId.set(Number(id));
      this.employeeService.getById(Number(id)).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.form.patchValue(res.data);
          }
        }
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const obs = this.isEditMode()
      ? this.employeeService.update(this.employeeId()!, this.form.value)
      : this.employeeService.create(this.form.value);

    obs.subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success) {
          this.snackBar.open(`Employee ${this.isEditMode() ? 'updated' : 'created'} successfully`, 'Close', { duration: 3000 });
          this.router.navigate(['/admin/employees']);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.snackBar.open(err.error?.message || 'Failed to save employee', 'Close', { duration: 3000 });
      }
    });
  }
}
