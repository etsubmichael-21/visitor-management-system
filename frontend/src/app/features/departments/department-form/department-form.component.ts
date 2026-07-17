import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { DepartmentService } from '../../../core/services/department.service';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-department-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf],
  template: `
    <div class="form-page">
      <div class="page-header">
        <h1 class="page-title">{{ isEdit ? 'Edit Department' : 'Add Department' }}</h1>
        <p class="page-subtitle">{{ isEdit ? 'Update department information' : 'Create a new department' }}</p>
      </div>

      <div class="form-card">
        <form [formGroup]="departmentForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label">Name *</label>
            <input type="text" class="form-control" formControlName="name" placeholder="Department name" />
            <p *ngIf="departmentForm.get('name')?.invalid && departmentForm.get('name')?.touched" class="form-error">Name is required</p>
          </div>

          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea class="form-control" formControlName="description" rows="3" placeholder="Department description"></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Location</label>
              <input type="text" class="form-control" formControlName="location" placeholder="Building, floor" />
            </div>
            <div class="form-group">
              <label class="form-label">Phone</label>
              <input type="text" class="form-control" formControlName="phone" placeholder="Contact phone" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" class="form-control" formControlName="email" placeholder="dept@ecx.et" />
          </div>

          <div class="form-actions">
            <a routerLink="/departments" class="btn btn-secondary">Cancel</a>
            <button type="submit" class="btn btn-primary" [disabled]="departmentForm.invalid || submitting">
              {{ submitting ? 'Saving...' : (isEdit ? 'Update Department' : 'Add Department') }}
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
    textarea.form-control { resize: vertical; }
    .form-actions { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #f1f5f9; }
    .btn { padding: 0.625rem 1.25rem; border: none; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; transition: background 0.2s; }
    .btn-primary { background: #3b82f6; color: #fff; }
    .btn-primary:hover:not(:disabled) { background: #2563eb; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-secondary { background: #e2e8f0; color: #475569; }
    .btn-secondary:hover { background: #cbd5e1; }
  `],
})
export class DepartmentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private departmentService = inject(DepartmentService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notification = inject(NotificationService);

  isEdit = false;
  deptId = 0;
  submitting = false;

  departmentForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
    location: [''],
    phone: [''],
    email: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.deptId = +id;
      this.departmentService.getById(this.deptId).subscribe((d) =>
        this.departmentForm.patchValue({ ...d, description: d.description ?? undefined, location: d.location ?? undefined, phone: d.phone ?? undefined, email: d.email ?? undefined })
      );
    }
  }

  onSubmit(): void {
    if (this.departmentForm.invalid) return;
    this.submitting = true;
    const data = this.departmentForm.getRawValue();
    const request = this.isEdit
      ? this.departmentService.update(this.deptId, data)
      : this.departmentService.create(data);
    request.subscribe({
      next: () => {
        this.notification.showSuccess(this.isEdit ? 'Department updated' : 'Department created');
        this.router.navigate(['/departments']);
      },
      error: () => (this.submitting = false),
    });
  }
}
