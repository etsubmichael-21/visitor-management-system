import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="status-badge" [ngClass]="status">{{ label || (status | titlecase) }}</span>
  `,
  styles: [`
    .status-badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      white-space: nowrap;
    }

    .pending { background: #fff3e0; color: #e65100; }
    .approved { background: #e8f5e9; color: #2e7d32; }
    .rejected { background: #ffebee; color: #c62828; }
    .cancelled { background: #f3e5f5; color: #7b1fa2; }
    .completed { background: #e3f2fd; color: #1565c0; }
    .checked-in { background: #e0f2f1; color: #00695c; }
    .checked-out { background: #eceff1; color: #455a64; }
    .no-show { background: #fbe9e7; color: #bf360c; }
    .active { background: #e8f5e9; color: #2e7d32; }
    .inactive { background: #f5f5f5; color: #757575; }
  `],
})
export class StatusBadgeComponent {
  @Input() status = '';
  @Input() label = '';
}
