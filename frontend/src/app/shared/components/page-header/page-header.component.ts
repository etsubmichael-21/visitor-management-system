import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [NgIf],
  template: `
    <div class="page-header">
      <div class="page-header-content">
        <h1 class="page-title">{{ title }}</h1>
        <p *ngIf="subtitle" class="page-subtitle">{{ subtitle }}</p>
      </div>
      <div class="page-header-actions">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .page-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }
    .page-subtitle {
      margin: 0.25rem 0 0;
      color: #64748b;
      font-size: 0.875rem;
    }
    .page-header-actions {
      display: flex;
      gap: 0.75rem;
      align-items: center;
      flex-wrap: wrap;
    }
  `],
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
}
