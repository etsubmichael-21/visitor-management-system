import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { VisitService } from '../../../core/services/visit.service';
import { Visit } from '../../../core/models/visit.model';

@Component({
  selector: 'app-check-out',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatCheckboxModule,
    MatProgressSpinnerModule, MatSnackBarModule
  ],
  template: `
    <div class="check-out">
      <div class="page-header">
        <h1>Visitor Check-Out</h1>
      </div>

      <mat-card class="search-card">
        <mat-card-header><mat-card-title>Find Visitor</mat-card-title></mat-card-header>
        <mat-card-content>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Search by Badge Number or Name</mat-label>
            <input matInput [(ngModel)]="searchTerm" (keyup.enter)="searchVisitors()">
            <button mat-icon-button matSuffix (click)="searchVisitors()"><mat-icon>search</mat-icon></button>
          </mat-form-field>
        </mat-card-content>
      </mat-card>

      <div class="visitor-results">
        @for (visitor of foundVisitors(); track visitor.id) {
          <mat-card class="visitor-checkout-card" [class.selected]="selectedVisitor()?.id === visitor.id">
            <mat-card-content>
              <div class="visitor-row">
                <div class="visitor-avatar">{{ visitor.visitorName?.charAt(0) || '?' }}</div>
                <div class="visitor-info">
                  <strong>{{ visitor.visitorName }}</strong>
                  <p>Host: {{ visitor.employeeName }} | Badge: {{ visitor.badgeNumber || 'N/A' }}</p>
                  <small>Checked in: {{ visitor.checkInTime }}</small>
                  <p *ngIf="visitor.visitorItems" class="items"><mat-icon>inventory_2</mat-icon> Items: {{ visitor.visitorItems }}</p>
                </div>
                <button mat-raised-button color="primary" (click)="selectVisitor(visitor)">
                  <mat-icon>logout</mat-icon> Select
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        }
      </div>

      @if (selectedVisitor()) {
        <mat-card class="checkout-form-card">
          <mat-card-header>
            <mat-card-title>Check-Out: {{ selectedVisitor()!.visitorName }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="visitor-summary">
              <p><strong>Badge #:</strong> {{ selectedVisitor()!.badgeNumber || 'N/A' }}</p>
              <p><strong>Checked In:</strong> {{ selectedVisitor()!.checkInTime }}</p>
              <p><strong>Items Carried In:</strong> {{ selectedVisitor()!.visitorItems || 'None' }}</p>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Items Returned</mat-label>
              <input matInput [(ngModel)]="itemsReturned" placeholder="Confirm items returned">
            </mat-form-field>

            <div class="checkbox-row">
              <mat-checkbox [(ngModel)]="badgeReturned" color="primary">Badge Returned</mat-checkbox>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Notes</mat-label>
              <textarea matInput [(ngModel)]="notes" rows="2"></textarea>
            </mat-form-field>

            <div class="form-actions">
              <button mat-stroked-button (click)="selectedVisitor.set(null)">Cancel</button>
              <button mat-raised-button color="warn" (click)="checkOut()" [disabled]="isLoading() || !badgeReturned">
                @if (isLoading()) { <mat-spinner diameter="20"></mat-spinner> }
                <mat-icon>logout</mat-icon> Complete Check-Out
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #2e7d32; }
    .page-header h1 { font-size: 24px; font-weight: 500; color: #1b5e20; }
    .search-card { margin-bottom: 16px; }
    .full-width { width: 100%; }
    .visitor-results { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
    .visitor-checkout-card { cursor: pointer; transition: all 0.2s; }
    .visitor-checkout-card:hover, .visitor-checkout-card.selected { border: 2px solid #2e7d32; }
    .visitor-row { display: flex; align-items: center; gap: 16px; }
    .visitor-avatar { width: 48px; height: 48px; border-radius: 50%; background: #f9a825; color: #1a237e; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 20px; flex-shrink: 0; }
    .visitor-info { flex: 1; }
    .visitor-info strong { font-size: 16px; display: block; }
    .visitor-info p { font-size: 13px; color: #555; margin: 2px 0; }
    .visitor-info small { font-size: 12px; color: #999; }
    .items { display: flex; align-items: center; gap: 4px; color: #f57f17; font-size: 12px; }
    .items mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .checkout-form-card { border: 2px solid #c62828; }
    .visitor-summary { background: #fafafa; padding: 12px; border-radius: 4px; margin-bottom: 16px; }
    .visitor-summary p { margin: 4px 0; font-size: 14px; }
    .checkbox-row { margin: 16px 0; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px; }
    .form-actions button { display: flex; align-items: center; gap: 8px; }
  `]
})
export class CheckOutComponent implements OnInit {
  private visitService = inject(VisitService);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  foundVisitors = signal<Visit[]>([]);
  selectedVisitor = signal<Visit | null>(null);
  isLoading = signal(false);
  searchTerm = '';
  itemsReturned = '';
  badgeReturned = false;
  notes = '';

  ngOnInit(): void {
    const visitId = this.route.snapshot.queryParamMap.get('visitId');
    if (visitId) {
      this.visitService.getById(Number(visitId)).subscribe({
        next: (res) => { if (res.success && res.data) { this.foundVisitors.set([res.data]); this.selectedVisitor.set(res.data); } }
      });
    }
  }

  searchVisitors(): void {
    if (!this.searchTerm) return;
    this.visitService.getActiveVisits().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const filtered = res.data.filter((v: Visit) =>
            v.visitorName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            v.badgeNumber?.toLowerCase().includes(this.searchTerm.toLowerCase())
          );
          this.foundVisitors.set(filtered);
        }
      }
    });
  }

  selectVisitor(visitor: Visit): void { this.selectedVisitor.set(visitor); }

  checkOut(): void {
    const visitor = this.selectedVisitor();
    if (!visitor) return;
    this.isLoading.set(true);
    this.visitService.checkOut(visitor.id, {
      securityOfficer: 'Security Officer',
      remark: this.notes
    }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success) {
          this.snackBar.open('Visitor checked out successfully', 'Close', { duration: 3000 });
          this.selectedVisitor.set(null);
          this.foundVisitors.set([]);
          this.searchTerm = '';
          this.itemsReturned = '';
          this.badgeReturned = false;
          this.notes = '';
        }
      },
      error: (err) => { this.isLoading.set(false); this.snackBar.open(err.error?.message || 'Check-out failed', 'Close', { duration: 3000 }); }
    });
  }
}
