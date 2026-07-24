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
  styleUrls: ['./notification-toast.component.scss'],
})
export class NotificationToastComponent {
  private notificationService = inject(NotificationService);
  toasts$ = this.notificationService.toasts$;

  remove(id: number): void {
    this.notificationService.remove(id);
  }
}
