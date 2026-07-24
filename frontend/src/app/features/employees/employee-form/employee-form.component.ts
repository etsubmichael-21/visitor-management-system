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
  styleUrls: ['./employee-form.component.scss'],
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
