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
  styleUrls: ['./visitor-form.component.scss'],
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
