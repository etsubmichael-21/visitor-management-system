import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIf, DatePipe } from '@angular/common';
import { VisitService } from '../../../core/services/visit.service';
import { Visit } from '../../../core/models/visit.model';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-check-out',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf, DatePipe],
  template: `
    <div class="form-page">
      <div class="page-header">
        <h1 class="page-title">Check Out</h1>
        <p *ngIf="visit" class="page-subtitle">{{ visit.visitorName }} — {{ visit.purpose }}</p>
      </div>

      <div class="form-card" *ngIf="visit">
        <div class="visit-info">
          <div class="info-row"><span>Visitor</span><span>{{ visit.visitorName }}</span></div>
          <div class="info-row"><span>Employee</span><span>{{ visit.employeeName }}</span></div>
          <div class="info-row"><span>Check In</span><span>{{ visit.checkInTime | date:'medium' }}</span></div>
          <div class="info-row"><span>Badge</span><span>{{ visit.badgeNumber || '—' }}</span></div>
        </div>

        <form [formGroup]="checkOutForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label">Remark (optional)</label>
            <textarea class="form-control" formControlName="remark" rows="3" placeholder="Any notes about this visit"></textarea>
          </div>

          <div class="form-actions">
            <a routerLink="/visits" class="btn btn-secondary">Cancel</a>
            <button type="submit" class="btn btn-primary" [disabled]="submitting">
              {{ submitting ? 'Processing...' : 'Confirm Check Out' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .form-page { max-width: 500px; }
    .page-header { margin-bottom: 1.5rem; }
    .page-title { font-size: 1.5rem; font-weight: 700; color: #1e293b; margin: 0; }
    .page-subtitle { color: #64748b; font-size: 0.875rem; margin: 0.25rem 0 0; }
    .form-card { background: #fff; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .visit-info { margin-bottom: 1.5rem; }
    .info-row { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #f1f5f9; font-size: 0.875rem; }
    .info-row span:first-child { color: #64748b; }
    .info-row span:last-child { color: #334155; font-weight: 500; }
    .form-group { display: flex; flex-direction: column; gap: 0.375rem; margin-bottom: 1rem; }
    .form-label { font-size: 0.875rem; font-weight: 600; color: #334155; }
    .form-control { padding: 0.625rem 0.875rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.875rem; outline: none; font-family: inherit; transition: border-color 0.2s, box-shadow 0.2s; }
    .form-control:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
    textarea.form-control { resize: vertical; }
    .form-actions { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #f1f5f9; }
    .btn { padding: 0.625rem 1.25rem; border: none; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; transition: background 0.2s; }
    .btn-primary { background: #10b981; color: #fff; }
    .btn-primary:hover:not(:disabled) { background: #059669; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-secondary { background: #e2e8f0; color: #475569; }
    .btn-secondary:hover { background: #cbd5e1; }
  `],
})
export class CheckOutComponent implements OnInit {
  private fb = inject(FormBuilder);
  private visitService = inject(VisitService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notification = inject(NotificationService);

  visit: Visit | null = null;
  submitting = false;

  checkOutForm = this.fb.nonNullable.group({
    remark: [''],
  });

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.visitService.getById(id).subscribe((v) => (this.visit = v));
  }

  onSubmit(): void {
    if (!this.visit) return;
    this.submitting = true;
    this.visitService.checkOut(this.visit.id, { remark: this.checkOutForm.value.remark || undefined }).subscribe({
      next: () => {
        this.notification.showSuccess('Visitor checked out');
        this.router.navigate(['/visits']);
      },
      error: () => (this.submitting = false),
    });
  }
}
