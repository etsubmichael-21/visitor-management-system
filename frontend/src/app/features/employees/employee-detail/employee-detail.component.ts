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
  styleUrls: ['./employee-detail.component.scss'],
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
