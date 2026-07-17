import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { VisitorService, Visitor } from '../../../core/services/visitor.service';

@Component({
  selector: 'app-visitor-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatIconModule, MatButtonModule, MatDividerModule, MatTableModule],
  template: `
    <div class="visitor-detail">
      <div class="page-header">
        <h1>Visitor Details</h1>
        <a mat-stroked-button color="primary" routerLink="/admin/visitors">
          <mat-icon>arrow_back</mat-icon> Back
        </a>
      </div>

      @if (visitor()) {
        <div class="detail-grid">
          <mat-card>
            <mat-card-content>
              <div class="profile-header">
                <div class="avatar-large">{{ visitor()!.firstName.charAt(0) }}{{ visitor()!.lastName.charAt(0) }}</div>
                <h2>{{ visitor()!.firstName }} {{ visitor()!.lastName }}</h2>
                <span class="ecx-status-badge" [ngClass]="visitor()!.isBlacklisted ? 'rejected' : 'active'">
                  {{ visitor()!.isBlacklisted ? 'Blacklisted' : 'Regular Visitor' }}
                </span>
              </div>
              <mat-divider></mat-divider>
              <div class="info-list">
                <div class="info-item"><mat-icon>email</mat-icon><div><small>Email</small><p>{{ visitor()!.email }}</p></div></div>
                <div class="info-item"><mat-icon>phone</mat-icon><div><small>Phone</small><p>{{ visitor()!.phone }}</p></div></div>
                <div class="info-item"><mat-icon>business</mat-icon><div><small>Company</small><p>{{ visitor()!.company || 'N/A' }}</p></div></div>
                <div class="info-item"><mat-icon>badge</mat-icon><div><small>ID Type</small><p>{{ visitor()!.idType }}</p></div></div>
                <div class="info-item"><mat-icon>pin</mat-icon><div><small>ID Number</small><p>{{ visitor()!.idNumber }}</p></div></div>
                <div class="info-item"><mat-icon>event</mat-icon><div><small>Total Visits</small><p>{{ visitor()!.totalVisits }}</p></div></div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-header><mat-card-title>Visit History</mat-card-title></mat-card-header>
            <mat-card-content>
              @for (visit of visitHistory(); track visit.id) {
                <div class="visit-item">
                  <div class="visit-date">{{ visit.checkInTime }}</div>
                  <div class="visit-info">
                    <strong>{{ visit.hostEmployeeName || 'N/A' }}</strong>
                    <p>{{ visit.purpose }}</p>
                  </div>
                  <span class="ecx-status-badge" [ngClass]="visit.status.toLowerCase()">{{ visit.status }}</span>
                </div>
              }
              @if (!visitHistory().length) {
                <p class="empty-state">No visit history</p>
              }
            </mat-card-content>
          </mat-card>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #2e7d32; }
    .page-header h1 { font-size: 24px; font-weight: 500; color: #1b5e20; }
    .page-header a { display: flex; align-items: center; gap: 4px; }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .profile-header { text-align: center; padding: 24px 0; }
    .avatar-large { width: 80px; height: 80px; border-radius: 50%; background: #2e7d32; color: white; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 700; margin: 0 auto 12px; }
    .profile-header h2 { margin: 0; }
    .info-list { padding: 16px 0; }
    .info-item { display: flex; gap: 16px; padding: 12px 0; }
    .info-item mat-icon { color: #2e7d32; margin-top: 2px; }
    .info-item small { font-size: 11px; color: #999; display: block; }
    .info-item p { margin: 2px 0 0; font-size: 14px; }
    .visit-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
    .visit-date { font-size: 12px; color: #1a237e; min-width: 80px; }
    .visit-info { flex: 1; }
    .visit-info strong { font-size: 14px; display: block; }
    .visit-info p { font-size: 12px; color: #666; margin: 2px 0; }
    .empty-state { text-align: center; color: #999; padding: 24px; }
    @media (max-width: 768px) { .detail-grid { grid-template-columns: 1fr; } }
  `]
})
export class VisitorDetailComponent implements OnInit {
  private visitorService = inject(VisitorService);
  private route = inject(ActivatedRoute);
  visitor = signal<Visitor | null>(null);
  visitHistory = signal<any[]>([]);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.visitorService.getById(Number(id)).subscribe({
        next: (res) => { if (res.success) this.visitor.set(res.data); }
      });
      this.visitorService.getVisitHistory(Number(id)).subscribe({
        next: (res) => { if (res.success) this.visitHistory.set(res.data || []); }
      });
    }
  }
}
