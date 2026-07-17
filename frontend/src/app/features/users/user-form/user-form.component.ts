import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { UserService } from '../../../core/services/user.service';
import { UserRole } from '../../../core/models/user.model';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf],
  template: `
    <div class="form-page">
      <div class="page-header">
        <h1 class="page-title">{{ isEdit ? 'Edit User' : 'Add User' }}</h1>
        <p class="page-subtitle">{{ isEdit ? 'Update user account' : 'Create a new user account' }}</p>
      </div>

      <div class="form-card">
        <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Full Name *</label>
              <input type="text" class="form-control" formControlName="fullName" placeholder="Enter full name" />
              <p *ngIf="userForm.get('fullName')?.invalid && userForm.get('fullName')?.touched" class="form-error">Name is required</p>
            </div>
            <div class="form-group">
              <label class="form-label">Email *</label>
              <input type="email" class="form-control" formControlName="email" placeholder="user@ecx.et" />
              <p *ngIf="userForm.get('email')?.invalid && userForm.get('email')?.touched" class="form-error">Valid email is required</p>
            </div>
          </div>

          <ng-container *ngIf="!isEdit">
            <div class="form-group">
              <label class="form-label">Password *</label>
              <input type="password" class="form-control" formControlName="password" placeholder="Minimum 6 characters" />
              <p *ngIf="userForm.get('password')?.invalid && userForm.get('password')?.touched" class="form-error">Password is required (min 6 chars)</p>
            </div>
          </ng-container>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Role *</label>
              <select class="form-control" formControlName="role">
                <option value="Admin">Admin</option>
                <option value="Receptionist">Receptionist</option>
                <option value="Security">Security</option>
                <option value="Visitor">Visitor</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Active</label>
              <select class="form-control" formControlName="isActive">
                <option [ngValue]="true">Active</option>
                <option [ngValue]="false">Inactive</option>
              </select>
            </div>
          </div>

          <div class="form-actions">
            <a routerLink="/users" class="btn btn-secondary">Cancel</a>
            <button type="submit" class="btn btn-primary" [disabled]="userForm.invalid || submitting">
              {{ submitting ? 'Saving...' : (isEdit ? 'Update User' : 'Add User') }}
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
export class UserFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notification = inject(NotificationService);

  isEdit = false;
  userId = 0;
  submitting = false;

  userForm = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.minLength(6)]],
    role: ['Receptionist' as UserRole],
    isActive: [true],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.userId = +id;
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();
      this.userService.getById(this.userId).subscribe((u) => {
        this.userForm.patchValue({ fullName: u.fullName, email: u.email, role: u.role, isActive: u.isActive });
      });
    }
  }

  onSubmit(): void {
    if (this.userForm.invalid) return;
    this.submitting = true;
    const raw = this.userForm.getRawValue();
    if (this.isEdit) {
      this.userService.update(this.userId, { fullName: raw.fullName, email: raw.email, role: raw.role, isActive: raw.isActive }).subscribe({
        next: () => { this.notification.showSuccess('User updated'); this.router.navigate(['/users']); },
        error: () => (this.submitting = false),
      });
    } else {
      this.userService.create({ fullName: raw.fullName, email: raw.email, password: raw.password || 'changeme', role: raw.role, isActive: raw.isActive }).subscribe({
        next: () => { this.notification.showSuccess('User created'); this.router.navigate(['/users']); },
        error: () => (this.submitting = false),
      });
    }
  }
}
