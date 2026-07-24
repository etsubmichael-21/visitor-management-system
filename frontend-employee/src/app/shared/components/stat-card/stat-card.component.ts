import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="stat-card" [style.borderLeftColor]="color">
      <div class="stat-icon" [style.background]="color + '15'" [style.color]="color">
        <mat-icon>{{ icon }}</mat-icon>
      </div>
      <div class="stat-info">
        <h3>{{ value }}</h3>
        <p>{{ label }}</p>
      </div>
    </div>
  `,
  styleUrls: ['./stat-card.component.scss']
})
export class StatCardComponent {
  @Input() value: number | string = 0;
  @Input() label = '';
  @Input() icon = 'info';
  @Input() color = '#0F6B3A';
}
