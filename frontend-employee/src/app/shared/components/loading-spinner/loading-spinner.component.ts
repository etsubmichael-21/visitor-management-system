import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="loading-spinner" [class.overlay]="overlay">
      <mat-spinner [diameter]="diameter"></mat-spinner>
      @if (message) {
        <p>{{ message }}</p>
      }
    </div>
  `,
  styles: [`
    .loading-spinner {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; padding: 48px; gap: 16px;
    }
    .loading-spinner.overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(255,255,255,0.8); z-index: 1000;
    }
    .loading-spinner p { color: #666; font-size: 14px; }
  `]
})
export class LoadingSpinnerComponent {
  @Input() diameter = 48;
  @Input() message = '';
  @Input() overlay = false;
}
