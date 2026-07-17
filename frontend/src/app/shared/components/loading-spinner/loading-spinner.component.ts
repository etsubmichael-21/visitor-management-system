import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="spinner-container" [class.overlay]="overlay" [class.fullpage]="fullpage">
      <div class="spinner-wrapper">
        <mat-spinner [diameter]="diameter"></mat-spinner>
        <p *ngIf="message" class="spinner-message">{{ message }}</p>
      </div>
    </div>
  `,
  styles: [`
    .spinner-container {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
    }

    .spinner-container.overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.85);
      z-index: 100;
    }

    .spinner-container.fullpage {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      z-index: 9999;
    }

    .spinner-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .spinner-message {
      font-size: 14px;
      color: #64748b;
    }
  `],
})
export class LoadingSpinnerComponent {
  @Input() diameter = 40;
  @Input() message = '';
  @Input() overlay = false;
  @Input() fullpage = false;
  @Input() loading = false;
}
