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
  styleUrls: ['./check-in.component.scss'],
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
