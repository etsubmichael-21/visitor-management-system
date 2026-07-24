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
  styleUrls: ['./visitor-detail.component.scss'],
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
