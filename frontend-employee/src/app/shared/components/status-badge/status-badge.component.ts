import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="status-badge" [ngClass]="statusClass">{{ label || status }}</span>
  `,
  styles: [`
    .status-badge {
      display: inline-block; padding: 4px 12px; border-radius: 16px;
      font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;
    }
    .status-badge.pending { background: #fff3e0; color: #e65100; }
    .status-badge.approved { background: #e8f5e9; color: #2e7d32; }
    .status-badge.rejected { background: #ffebee; color: #c62828; }
    .status-badge.completed { background: #e3f2fd; color: #1565c0; }
    .status-badge.checked-in { background: #e8f5e9; color: #2e7d32; }
    .status-badge.checked-out { background: #f3e5f5; color: #6a1b9a; }
    .status-badge.cancelled { background: #fafafa; color: #616161; }
    .status-badge.active { background: #e8f5e9; color: #2e7d32; }
    .status-badge.inactive { background: #fafafa; color: #616161; }
    .status-badge.expected { background: #e3f2fd; color: #1565c0; }
    .status-badge.delegated { background: #ede7f6; color: #4527a0; }
  `]
})
export class StatusBadgeComponent {
  @Input() status = '';
  @Input() label = '';

  get statusClass(): string {
    return this.status.toLowerCase().replace(/[_\s]+/g, '-');
  }
}
