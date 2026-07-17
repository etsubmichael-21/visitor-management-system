import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { VisitorService } from '../../../core/services/visitor.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { VisitorCreate } from '../../../core/models/visitor.model';

@Component({
  selector: 'app-visitor-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf],
  template: `
    <div class="form-page">
      <div class="page-header">
        <h1 class="page-title">{{ isEdit ? 'Edit Visitor' : 'Add Visitor' }}</h1>
        <p class="page-subtitle">{{ isEdit ? 'Update visitor information' : 'Register a new visitor' }}</p>
      </div>

      <div class="form-card">
        <form [formGroup]="visitorForm" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Full Name *</label>
              <input type="text" class="form-control" formControlName="fullName" placeholder="Enter full name" />
              <p *ngIf="visitorForm.get('fullName')?.invalid && visitorForm.get('fullName')?.touched" class="form-error">Name is required</p>
            </div>
            <div class="form-group">
              <label class="form-label">Email *</label>
              <input type="email" class="form-control" formControlName="email" placeholder="visitor@example.com" />
              <p *ngIf="visitorForm.get('email')?.invalid && visitorForm.get('email')?.touched" class="form-error">Valid email is required</p>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Phone *</label>
              <input type="text" class="form-control" formControlName="phone" placeholder="+251-XXX-XXXXXXX" />
              <p *ngIf="visitorForm.get('phone')?.invalid && visitorForm.get('phone')?.touched" class="form-error">Phone is required</p>
            </div>
            <div class="form-group">
              <label class="form-label">National ID</label>
              <input type="text" class="form-control" formControlName="nationalId" placeholder="Optional" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Address *</label>
            <textarea class="form-control" formControlName="address" rows="2" placeholder="Enter address"></textarea>
            <p *ngIf="visitorForm.get('address')?.invalid && visitorForm.get('address')?.touched" class="form-error">Address is required</p>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Organization</label>
              <input type="text" class="form-control" formControlName="organization" placeholder="Company name" />
            </div>
            <div class="form-group">
              <label class="form-label">Gender</label>
              <select class="form-control" formControlName="gender">
                <option [ngValue]="null">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div class="form-actions">
            <a routerLink="/visitors" class="btn btn-secondary">Cancel</a>
            <button type="submit" class="btn btn-primary" [disabled]="visitorForm.invalid || submitting">
              {{ submitting ? 'Saving...' : (isEdit ? 'Update Visitor' : 'Add Visitor') }}
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
    .form-card {
      background: #fff;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    @media (max-width: 600px) { .form-row { grid-template-columns: 1fr; } }
    .form-group { display: flex; flex-direction: column; gap: 0.375rem; margin-bottom: 1rem; }
    .form-label { font-size: 0.875rem; font-weight: 600; color: #334155; }
    .form-control {
      padding: 0.625rem 0.875rem;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.875rem;
      outline: none;
      font-family: inherit;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .form-control:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
    .form-control.ng-invalid.ng-touched { border-color: #ef4444; }
    .form-error { margin: 0; color: #ef4444; font-size: 0.75rem; }
    textarea.form-control { resize: vertical; }
    select.form-control { cursor: pointer; }
    .form-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #f1f5f9;
    }
    .btn {
      padding: 0.625rem 1.25rem;
      border: none;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      transition: background 0.2s;
    }
    .btn-primary { background: #3b82f6; color: #fff; }
    .btn-primary:hover:not(:disabled) { background: #2563eb; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-secondary { background: #e2e8f0; color: #475569; }
    .btn-secondary:hover { background: #cbd5e1; }
  `],
})
export class VisitorFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private visitorService = inject(VisitorService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notification = inject(NotificationService);

  isEdit = false;
  visitorId = 0;
  submitting = false;

  visitorForm = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    address: ['', Validators.required],
    nationalId: [''],
    organization: [''],
    gender: ['' as 'Male' | 'Female' | 'Other' | ''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.visitorId = +id;
      this.visitorService.getById(this.visitorId).subscribe((v) =>
        this.visitorForm.patchValue({ ...v, nationalId: v.nationalId ?? undefined, organization: v.organization ?? undefined, gender: (v.gender ?? '') as '' | 'Male' | 'Female' | 'Other' })
      );
    }
  }

  onSubmit(): void {
    if (this.visitorForm.invalid) return;
    this.submitting = true;
    const raw = this.visitorForm.getRawValue();
    const data = { ...raw, gender: raw.gender || undefined } as VisitorCreate;
    const request = this.isEdit
      ? this.visitorService.update(this.visitorId, data)
      : this.visitorService.create(data);
    request.subscribe({
      next: () => {
        this.notification.showSuccess(this.isEdit ? 'Visitor updated' : 'Visitor created');
        this.router.navigate(['/visitors']);
      },
      error: () => (this.submitting = false),
    });
  }
}
