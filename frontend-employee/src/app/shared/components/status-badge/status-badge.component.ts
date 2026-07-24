import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="status-badge" [ngClass]="statusClass">{{ label || status }}</span>
  `,
  styleUrls: ['./status-badge.component.scss']
})
export class StatusBadgeComponent {
  @Input() status = '';
  @Input() label = '';

  get statusClass(): string {
    return this.status.toLowerCase().replace(/[_\s]+/g, '-');
  }
}
