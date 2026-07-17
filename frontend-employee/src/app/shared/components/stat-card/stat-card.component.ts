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
  styles: [`
    .stat-card {
      background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      padding: 20px; display: flex; align-items: center; gap: 16px;
      border-left: 4px solid; transition: transform 0.2s;
    }
    .stat-card:hover { transform: translateY(-2px); }
    .stat-icon { width: 56px; height: 56px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .stat-icon mat-icon { font-size: 28px; }
    .stat-info h3 { font-size: 28px; font-weight: 700; margin: 0; }
    .stat-info p { font-size: 13px; color: #666; margin: 4px 0 0; }
  `]
})
export class StatCardComponent {
  @Input() value: number | string = 0;
  @Input() label = '';
  @Input() icon = 'info';
  @Input() color = '#1a237e';
}
