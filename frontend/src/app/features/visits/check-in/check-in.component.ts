import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { VisitService } from '../../../core/services/visit.service';
import { VisitorService } from '../../../core/services/visitor.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { Visitor } from '../../../core/models/visitor.model';
import { Employee } from '../../../core/models/employee.model';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-check-in',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf, NgFor],
  template: `
    <div class="form-page">
      <div class="page-header">
        <h1 class="page-title">Visitor Check-In</h1>
        <p class="page-subtitle">Register a visitor's arrival</p>
      </div>

      <div class="form-card">
        <form [formGroup]="checkInForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label">Visitor *</label>
            <select class="form-control" formControlName="visitorId">
              <option [ngValue]="null" disabled>Select visitor</option>
              <option *ngFor="let v of visitors" [ngValue]="v.id">{{ v.fullName }} — {{ v.organization || v.email }}</option>
            </select>
            <p *ngIf="checkInForm.get('visitorId')?.invalid && checkInForm.get('visitorId')?.touched" class="form-error">Visitor is required</p>
            <a routerLink="/visitors/new" class="form-hint">+ Register new visitor</a>
          </div>

          <div class="form-group">
            <label class="form-label">Employee to Visit *</label>
            <select class="form-control" formControlName="employeeId">
              <option [ngValue]="null" disabled>Select employee</option>
              <option *ngFor="let e of employees" [ngValue]="e.id">{{ e.fullName }} — {{ e.position }}</option>
            </select>
            <p *ngIf="checkInForm.get('employeeId')?.invalid && checkInForm.get('employeeId')?.touched" class="form-error">Employee is required</p>
          </div>

          <div class="form-group">
            <label class="form-label">Purpose of Visit *</label>
            <input type="text" class="form-control" formControlName="purpose" placeholder="Reason for visit" />
            <p *ngIf="checkInForm.get('purpose')?.invalid && checkInForm.get('purpose')?.touched" class="form-error">Purpose is required</p>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Badge Number</label>
              <input type="text" class="form-control" formControlName="badgeNumber" placeholder="e.g. B-001" />
            </div>
            <div class="form-group">
              <label class="form-label">Security Officer</label>
              <input type="text" class="form-control" formControlName="securityOfficer" placeholder="Staff name" />
            </div>
          </div>

          <div class="form-actions">
            <a routerLink="/visits" class="btn btn-secondary">Cancel</a>
            <button type="submit" class="btn btn-primary" [disabled]="checkInForm.invalid || submitting">
              {{ submitting ? 'Processing...' : 'Check In' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .form-page { max-width: 600px; }
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
    .form-hint { font-size: 0.75rem; color: #3b82f6; text-decoration: none; }
    .form-hint:hover { text-decoration: underline; }
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
export class CheckInComponent implements OnInit {
  private fb = inject(FormBuilder);
  private visitService = inject(VisitService);
  private visitorService = inject(VisitorService);
  private employeeService = inject(EmployeeService);
  private router = inject(Router);
  private notification = inject(NotificationService);

  visitors: Visitor[] = [];
  employees: Employee[] = [];
  submitting = false;

  checkInForm = this.fb.nonNullable.group({
    visitorId: [null as number | null, Validators.required],
    employeeId: [null as number | null, Validators.required],
    purpose: ['', Validators.required],
    badgeNumber: [''],
    securityOfficer: [''],
  });

  ngOnInit(): void {
    this.visitorService.getAll({ pageSize: 100, sortBy: 'fullName' }).subscribe((v) => (this.visitors = v.items));
    this.employeeService.getAll({ pageSize: 100, sortBy: 'fullName', status: 'Active' } as any).subscribe((e) => (this.employees = e.items));
  }

  onSubmit(): void {
    if (this.checkInForm.invalid) return;
    this.submitting = true;
    const data = this.checkInForm.getRawValue();
    this.visitService.checkIn({
      visitorId: data.visitorId!,
      employeeId: data.employeeId!,
      purpose: data.purpose,
      badgeNumber: data.badgeNumber || undefined,
      securityOfficer: data.securityOfficer || undefined,
    }).subscribe({
      next: () => {
        this.notification.showSuccess('Visitor checked in successfully');
        this.router.navigate(['/visits']);
      },
      error: () => (this.submitting = false),
    });
  }
}
