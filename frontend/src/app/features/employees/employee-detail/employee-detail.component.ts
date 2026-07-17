import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIf, DatePipe } from '@angular/common';
import { EmployeeService } from '../../../core/services/employee.service';
import { Employee } from '../../../core/models/employee.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [NgIf, DatePipe, RouterLink, LoadingSpinnerComponent],
  template: `
    <app-loading-spinner [loading]="loading" />
    <ng-container *ngIf="!loading && employee">
      <div class="detail-page">
        <div class="page-header">
          <div>
            <h1 class="page-title">{{ employee.fullName }}</h1>
            <p class="page-subtitle">{{ employee.position }}</p>
          </div>
          <div class="page-actions">
            <a [routerLink]="['/employees', employee.id, 'edit']" class="btn btn-secondary">Edit</a>
            <a routerLink="/employees" class="btn btn-outline">Back to List</a>
          </div>
        </div>
        <div class="detail-grid">
          <div class="card">
            <h3>Employee Information</h3>
            <div class="detail-row"><span>Name</span><span>{{ employee.fullName }}</span></div>
            <div class="detail-row"><span>Email</span><span>{{ employee.email }}</span></div>
            <div class="detail-row"><span>Phone</span><span>{{ employee.phone }}</span></div>
            <div class="detail-row"><span>Department</span><span>{{ employee.departmentName }}</span></div>
            <div class="detail-row"><span>Position</span><span>{{ employee.position }}</span></div>
            <div class="detail-row"><span>Office</span><span>{{ employee.officeNumber || '—' }}</span></div>
            <div class="detail-row"><span>Status</span><span [class.text-green]="employee.status === 'Active'" [class.text-yellow]="employee.status === 'OnLeave'" [class.text-red]="employee.status === 'Inactive'">{{ employee.status }}</span></div>
            <div class="detail-row"><span>Created</span><span>{{ employee.createdAt | date:'medium' }}</span></div>
          </div>
        </div>
      </div>
    </ng-container>
  `,
  styles: [`
    .detail-page { }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
    .page-title { font-size: 1.5rem; font-weight: 700; color: #1e293b; margin: 0; }
    .page-subtitle { color: #64748b; font-size: 0.875rem; margin: 0.25rem 0 0; }
    .page-actions { display: flex; gap: 0.75rem; }
    .detail-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 1rem; }
    .card { background: #fff; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .card h3 { margin: 0 0 1rem; font-size: 1rem; font-weight: 600; color: #1e293b; }
    .detail-row { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #f1f5f9; font-size: 0.875rem; }
    .detail-row:last-child { border-bottom: none; }
    .detail-row span:first-child { color: #64748b; font-weight: 500; }
    .detail-row span:last-child { color: #334155; text-align: right; }
    .text-green { color: #10b981 !important; font-weight: 600; }
    .text-yellow { color: #d97706 !important; font-weight: 600; }
    .text-red { color: #ef4444 !important; font-weight: 600; }
    .btn { padding: 0.5rem 1rem; border: none; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; transition: background 0.2s; }
    .btn-secondary { background: #e2e8f0; color: #475569; }
    .btn-secondary:hover { background: #cbd5e1; }
    .btn-outline { background: #fff; color: #475569; border: 1px solid #e2e8f0; }
    .btn-outline:hover { background: #f8fafc; }
  `],
})
export class EmployeeDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private employeeService = inject(EmployeeService);
  loading = true;
  employee: Employee | null = null;

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.employeeService.getById(id).subscribe({
      next: (e) => { this.employee = e; this.loading = false; },
      error: () => (this.loading = false),
    });
  }
}
