import { Component, Inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: 'danger' | 'warning' | 'info';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    <div class="dialog-overlay" (click)="dialogRef.close(false)">
      <div class="dialog" (click)="$event.stopPropagation()">
        <div class="dialog-header">
          <h3>{{ data.title }}</h3>
        </div>
        <div class="dialog-body">
          <p>{{ data.message }}</p>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-secondary" (click)="dialogRef.close(false)">
            {{ data.cancelLabel || 'Cancel' }}
          </button>
          <button
            class="btn"
            [class.btn-danger]="data.type === 'danger'"
            [class.btn-warning]="data.type === 'warning'"
            [class.btn-primary]="!data.type || data.type === 'info'"
            (click)="dialogRef.close(true)"
          >
            {{ data.confirmLabel || 'Confirm' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dialog-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9000;
    }
    .dialog {
      background: #fff;
      border-radius: 12px;
      padding: 1.5rem;
      max-width: 420px;
      width: 90%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .dialog-header h3 {
      margin: 0;
      font-size: 1.125rem;
      color: #1e293b;
    }
    .dialog-body {
      margin: 1rem 0;
      color: #64748b;
      font-size: 0.9rem;
      line-height: 1.5;
    }
    .dialog-footer {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
    }
    .btn {
      padding: 0.5rem 1.25rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 500;
      transition: background 0.2s;
    }
    .btn-primary { background: #3b82f6; color: #fff; }
    .btn-primary:hover { background: #2563eb; }
    .btn-danger { background: #ef4444; color: #fff; }
    .btn-danger:hover { background: #dc2626; }
    .btn-warning { background: #f59e0b; color: #fff; }
    .btn-warning:hover { background: #d97706; }
    .btn-secondary { background: #e2e8f0; color: #475569; }
    .btn-secondary:hover { background: #cbd5e1; }
  `],
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: DialogRef<boolean>,
    @Inject(DIALOG_DATA) public data: ConfirmDialogData
  ) {}
}
