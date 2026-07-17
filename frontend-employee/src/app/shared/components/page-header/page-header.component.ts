import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="page-header">
      <div class="header-left">
        @if (icon) {
          <mat-icon class="header-icon" [style.color]="iconColor">{{ icon }}</mat-icon>
        }
        <div>
          <h1>{{ title }}</h1>
          @if (subtitle) {
            <p class="subtitle">{{ subtitle }}</p>
          }
        </div>
      </div>
      <div class="header-actions">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #2e7d32;
    }
    .header-left { display: flex; align-items: center; gap: 12px; }
    .header-icon { font-size: 32px; width: 32px; height: 32px; }
    h1 { font-size: 24px; font-weight: 500; color: #1b5e20; margin: 0; }
    .subtitle { font-size: 13px; color: #666; margin: 2px 0 0; }
    .header-actions { display: flex; gap: 8px; align-items: center; }
  `]
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() icon = '';
  @Input() iconColor = '#2e7d32';
}
