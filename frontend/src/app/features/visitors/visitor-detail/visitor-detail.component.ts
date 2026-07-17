import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIf, DatePipe } from '@angular/common';
import { VisitorService } from '../../../core/services/visitor.service';
import { Visitor } from '../../../core/models/visitor.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-visitor-detail',
  standalone: true,
  imports: [NgIf, DatePipe, RouterLink, LoadingSpinnerComponent],
  template: `
    <app-loading-spinner [loading]="loading" />
    <ng-container *ngIf="!loading && visitor">
      <div class="detail-page">
        <div class="page-header">
          <div>
            <h1 class="page-title">{{ visitor.fullName }}</h1>
            <p class="page-subtitle">Visitor details and history</p>
          </div>
          <div class="page-actions">
            <a [routerLink]="['/visitors', visitor.id, 'edit']" class="btn btn-secondary">Edit</a>
            <a routerLink="/visitors" class="btn btn-outline">Back to List</a>
          </div>
        </div>

        <div class="detail-grid">
          <div class="card">
            <h3>Personal Information</h3>
            <div class="detail-row"><span>Name</span><span>{{ visitor.fullName }}</span></div>
            <div class="detail-row"><span>Email</span><span>{{ visitor.email }}</span></div>
            <div class="detail-row"><span>Phone</span><span>{{ visitor.phone }}</span></div>
            <div class="detail-row"><span>Gender</span><span>{{ visitor.gender || '—' }}</span></div>
            <div class="detail-row"><span>National ID</span><span>{{ visitor.nationalId || '—' }}</span></div>
            <div class="detail-row"><span>Organization</span><span>{{ visitor.organization || '—' }}</span></div>
            <div class="detail-row"><span>Address</span><span>{{ visitor.address }}</span></div>
            <div class="detail-row"><span>Status</span><span [class.text-green]="visitor.isActive" [class.text-red]="!visitor.isActive">{{ visitor.isActive ? 'Active' : 'Inactive' }}</span></div>
            <div class="detail-row"><span>Registered</span><span>{{ visitor.createdAt | date:'medium' }}</span></div>
          </div>
        </div>
      </div>
    </ng-container>
  `,
  styles: [`
    .detail-page { }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
    .page-title { font-size: 1.5rem; font-weight: 700; color: #1e293b; margin: 0; }
    .page-subtitle { color: #64748b; font-size: 0.875rem; margin: 0.25rem 0 0; }
    .page-actions { display: flex; gap: 0.75rem; }
    .detail-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 1rem; }
    .card {
      background: #fff;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }
    .card h3 { margin: 0 0 1rem; font-size: 1rem; font-weight: 600; color: #1e293b; }
    .detail-row { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #f1f5f9; font-size: 0.875rem; }
    .detail-row:last-child { border-bottom: none; }
    .detail-row span:first-child { color: #64748b; font-weight: 500; }
    .detail-row span:last-child { color: #334155; text-align: right; }
    .text-green { color: #10b981 !important; font-weight: 600; }
    .text-red { color: #ef4444 !important; font-weight: 600; }
    .btn {
      padding: 0.5rem 1rem;
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
    .btn-secondary { background: #e2e8f0; color: #475569; }
    .btn-secondary:hover { background: #cbd5e1; }
    .btn-outline { background: #fff; color: #475569; border: 1px solid #e2e8f0; }
    .btn-outline:hover { background: #f8fafc; }
  `],
})
export class VisitorDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private visitorService = inject(VisitorService);
  loading = true;
  visitor: Visitor | null = null;

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.visitorService.getById(id).subscribe({
      next: (v) => { this.visitor = v; this.loading = false; },
      error: () => (this.loading = false),
    });
  }
}
