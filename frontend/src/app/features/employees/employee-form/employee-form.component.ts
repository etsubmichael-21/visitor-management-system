import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { EmployeeService } from '../../../core/services/employee.service';
import { DepartmentService } from '../../../core/services/department.service';
import { Department } from '../../../core/models/department.model';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmployeeCreate, EmployeeStatus } from '../../../core/models/employee.model';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf, NgFor],
  template: `
    <div class="form-page">
      <div class="page-header">
        <h1 class="page-title">{{ isEdit ? 'Edit Employee' : 'Add Employee' }}</h1>
        <p class="page-subtitle">{{ isEdit ? 'Update employee information' : 'Register a new employee' }}</p>
      </div>

      <div class="form-card">
        <form [formGroup]="employeeForm" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Full Name *</label>
              <input type="text" class="form-control" formControlName="fullName" placeholder="Enter full name" />
              <p *ngIf="employeeForm.get('fullName')?.invalid && employeeForm.get('fullName')?.touched" class="form-error">Name is required</p>
            </div>
            <div class="form-group">
              <label class="form-label">Email *</label>
              <input type="email" class="form-control" formControlName="email" placeholder="employee@ecx.et" />
              <p *ngIf="employeeForm.get('email')?.invalid && employeeForm.get('email')?.touched" class="form-error">Valid email is required</p>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Phone *</label>
              <input type="text" class="form-control" formControlName="phone" placeholder="+251-XXX-XXXXXXX" />
              <p *ngIf="employeeForm.get('phone')?.invalid && employeeForm.get('phone')?.touched" class="form-error">Phone is required</p>
            </div>
            <div class="form-group">
              <label class="form-label">Department *</label>
              <select class="form-control" formControlName="departmentId">
                <option [ngValue]="null" disabled>Select department</option>
                <option *ngFor="let dept of departments" [ngValue]="dept.id">{{ dept.name }}</option>
              </select>
              <p *ngIf="employeeForm.get('departmentId')?.invalid && employeeForm.get('departmentId')?.touched" class="form-error">Department is required</p>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Position *</label>
              <input type="text" class="form-control" formControlName="position" placeholder="Job title" />
              <p *ngIf="employeeForm.get('position')?.invalid && employeeForm.get('position')?.touched" class="form-error">Position is required</p>
            </div>
            <div class="form-group">
              <label class="form-label">Office Number</label>
              <input type="text" class="form-control" formControlName="officeNumber" placeholder="e.g. A301" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Status</label>
            <select class="form-control" formControlName="status">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="OnLeave">On Leave</option>
            </select>
          </div>

          <div class="form-actions">
            <a routerLink="/employees" class="btn btn-secondary">Cancel</a>
            <button type="submit" class="btn btn-primary" [disabled]="employeeForm.invalid || submitting">
              {{ submitting ? 'Saving...' : (isEdit ? 'Update Employee' : 'Add Employee') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .form-page { max-width: 720px; }
    .page-header { margin-bottom: 1.5rem; }
    .page-title { font-size: 1.5rem; font-weight: 700; color: #1e293b; margin: 0; }
    .page-subtitle { color: #64748b; font-size: 0.875rem; margin: 0.25rem 0 0; }
    .form-card { background: #fff; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    @media (max-width: 600px) { .form-row { grid-template-columns: 1fr; } }
    .form-group { display: flex; flex-direction: column; gap: 0.375rem; margin-bottom: 1rem; }
    .form-label { font-size: 0.875rem; font-weight: 600; color: #334155; }
    .form-control { padding: 0.625rem 0.875rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.875rem; outline: none; font-family: inherit; transition: border-color 0.2s, box-shadow 0.2s; }
    .form-control:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
    .form-control.ng-invalid.ng-touched { border-color: #ef4444; }
    .form-error { margin: 0; color: #ef4444; font-size: 0.75rem; }
    select.form-control { cursor: pointer; }
    .form-actions { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #f1f5f9; }
    .btn { padding: 0.625rem 1.25rem; border: none; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; transition: background 0.2s; }
    .btn-primary { background: #3b82f6; color: #fff; }
    .btn-primary:hover:not(:disabled) { background: #2563eb; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-secondary { background: #e2e8f0; color: #475569; }
    .btn-secondary:hover { background: #cbd5e1; }
  `],
})
export class EmployeeFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private employeeService = inject(EmployeeService);
  private departmentService = inject(DepartmentService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notification = inject(NotificationService);

  isEdit = false;
  employeeId = 0;
  submitting = false;
  departments: Department[] = [];

  employeeForm = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    departmentId: [0 as number, Validators.required],
    position: ['', Validators.required],
    officeNumber: [''],
    status: ['Active' as EmployeeStatus],
  });

  ngOnInit(): void {
    this.departmentService.getAll({ pageSize: 50 }).subscribe((d) => (this.departments = d.items));
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.employeeId = +id;
      this.employeeService.getById(this.employeeId).subscribe((e) =>
        this.employeeForm.patchValue({ ...e, officeNumber: e.officeNumber ?? undefined })
      );
    }
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) return;
    this.submitting = true;
    const data = this.employeeForm.getRawValue() as EmployeeCreate;
    const request = this.isEdit
      ? this.employeeService.update(this.employeeId, data)
      : this.employeeService.create(data);
    request.subscribe({
      next: () => {
        this.notification.showSuccess(this.isEdit ? 'Employee updated' : 'Employee created');
        this.router.navigate(['/employees']);
      },
      error: () => (this.submitting = false),
    });
  }
}
