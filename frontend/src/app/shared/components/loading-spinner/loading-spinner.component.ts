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
  styleUrls: ['./loading-spinner.component.scss'],
})
export class LoadingSpinnerComponent {
  @Input() diameter = 40;
  @Input() message = '';
  @Input() overlay = false;
  @Input() fullpage = false;
  @Input() loading = false;
}
