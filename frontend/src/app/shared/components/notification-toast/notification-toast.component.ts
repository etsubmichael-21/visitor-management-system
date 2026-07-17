import { Component, inject } from '@angular/core';
import { AsyncPipe, NgFor, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { NotificationService, Toast } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-notification-toast',
  standalone: true,
  imports: [NgFor, AsyncPipe, NgSwitch, NgSwitchCase, NgSwitchDefault],
  template: `
    <div class="toast-container">
      <div
        *ngFor="let toast of toasts$ | async"
        class="toast"
        [class.toast-success]="toast.type === 'success'"
        [class.toast-error]="toast.type === 'error'"
        [class.toast-warning]="toast.type === 'warning'"
        [class.toast-info]="toast.type === 'info'"
        (click)="remove(toast.id)"
      >
        <div class="toast-icon">
          <ng-container [ngSwitch]="toast.type">
            <span *ngSwitchCase="'success'">✓</span>
            <span *ngSwitchCase="'error'">✕</span>
            <span *ngSwitchCase="'warning'">⚠</span>
            <span *ngSwitchDefault>ℹ</span>
          </ng-container>
        </div>
        <span class="toast-message">{{ toast.message }}</span>
        <button class="toast-close" (click)="remove(toast.id); $event.stopPropagation()">×</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-width: 400px;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      color: #fff;
      font-size: 0.875rem;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideIn 0.3s ease-out;
    }
    .toast-success { background: #10b981; }
    .toast-error { background: #ef4444; }
    .toast-warning { background: #f59e0b; }
    .toast-info { background: #3b82f6; }
    .toast-icon { font-size: 1.125rem; font-weight: 700; flex-shrink: 0; }
    .toast-message { flex: 1; }
    .toast-close {
      background: none;
      border: none;
      color: inherit;
      font-size: 1.25rem;
      cursor: pointer;
      padding: 0;
      line-height: 1;
      opacity: 0.7;
    }
    .toast-close:hover { opacity: 1; }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `],
})
export class NotificationToastComponent {
  private notificationService = inject(NotificationService);
  toasts$ = this.notificationService.toasts$;

  remove(id: number): void {
    this.notificationService.remove(id);
  }
}
