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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DepartmentService } from '../../../core/services/department.service';

@Component({
  selector: 'app-department-form',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSelectModule,
    MatProgressSpinnerModule, MatSnackBarModule
  ],
  template: `
    <div class="dept-form">
      <div class="page-header">
        <h1>{{ isEditMode() ? 'Edit Department' : 'Add Department' }}</h1>
        <a mat-stroked-button color="primary" routerLink="/admin/departments">
          <mat-icon>arrow_back</mat-icon> Back
        </a>
      </div>

      <mat-card>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Department Name</mat-label>
                <input matInput formControlName="name">
                @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
                  <mat-error>Name is required</mat-error>
                }
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Location</mat-label>
                <input matInput formControlName="location">
              </mat-form-field>
            </div>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="3"></textarea>
            </mat-form-field>
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Phone</mat-label>
                <input matInput formControlName="phone">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Email</mat-label>
                <input matInput formControlName="email" type="email">
              </mat-form-field>
            </div>
            <div class="form-actions">
              <button mat-stroked-button type="button" routerLink="/admin/departments">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="isLoading() || form.invalid">
                @if (isLoading()) { <mat-spinner diameter="20"></mat-spinner> }
                <mat-icon>save</mat-icon>
                {{ isEditMode() ? 'Update' : 'Create' }}
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
    .page-header a { display: flex; align-items: center; gap: 4px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 8px; }
    .full-width { width: 100%; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e0e0e0; }
    .form-actions button { display: flex; align-items: center; gap: 8px; }
    @media (max-width: 768px) { .form-row { grid-template-columns: 1fr; } }
  `]
})
export class DepartmentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private departmentService = inject(DepartmentService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  form!: FormGroup;
  isEditMode = signal(false);
  isLoading = signal(false);
  departmentId = signal<number | null>(null);

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      location: [''],
      phone: [''],
      email: ['']
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.departmentId.set(Number(id));
      this.departmentService.getById(Number(id)).subscribe({
        next: (res) => { if (res.success && res.data) this.form.patchValue(res.data); }
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isLoading.set(true);
    const obs = this.isEditMode()
      ? this.departmentService.update(this.departmentId()!, this.form.value)
      : this.departmentService.create(this.form.value);

    obs.subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success) {
          this.snackBar.open(`Department ${this.isEditMode() ? 'updated' : 'created'}`, 'Close', { duration: 3000 });
          this.router.navigate(['/admin/departments']);
        }
      },
      error: (err) => { this.isLoading.set(false); this.snackBar.open(err.error?.message || 'Failed', 'Close', { duration: 3000 }); }
    });
  }
}
