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
  styleUrls: ['./check-out.component.scss'],
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
