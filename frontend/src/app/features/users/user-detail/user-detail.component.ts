import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIf, DatePipe } from '@angular/common';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [NgIf, DatePipe, RouterLink, LoadingSpinnerComponent, StatusBadgeComponent],
  template: `
    <app-loading-spinner [loading]="loading" />
    <ng-container *ngIf="!loading && user">
      <div class="detail-page">
        <div class="page-header">
          <div>
            <h1 class="page-title">{{ user.fullName }}</h1>
            <p class="page-subtitle">{{ user.role }}</p>
          </div>
          <div class="page-actions">
            <a [routerLink]="['/users', user.id, 'edit']" class="btn btn-secondary">Edit</a>
            <a routerLink="/users" class="btn btn-outline">Back to List</a>
          </div>
        </div>
        <div class="detail-grid">
          <div class="card">
            <h3>Account Information</h3>
            <div class="detail-row"><span>Name</span><span>{{ user.fullName }}</span></div>
            <div class="detail-row"><span>Email</span><span>{{ user.email }}</span></div>
            <div class="detail-row"><span>Role</span><span><app-status-badge [status]="user.role" /></span></div>
            <div class="detail-row"><span>Active</span><span [class.text-green]="user.isActive" [class.text-red]="!user.isActive">{{ user.isActive ? 'Yes' : 'No' }}</span></div>
            <div class="detail-row"><span>Last Login</span><span>{{ user.lastLogin ? (user.lastLogin | date:'medium') : 'Never' }}</span></div>
            <div class="detail-row"><span>Created</span><span>{{ user.createdAt | date:'medium' }}</span></div>
          </div>
        </div>
      </div>
    </ng-container>
  `,
  styleUrls: ['./user-detail.component.scss'],
})
export class UserDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  loading = true;
  user: User | null = null;

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.userService.getById(id).subscribe({
      next: (u) => { this.user = u; this.loading = false; },
      error: () => (this.loading = false),
    });
  }
}
