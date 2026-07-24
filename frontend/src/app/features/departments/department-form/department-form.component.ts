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
  styleUrls: ['./department-form.component.scss'],
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
