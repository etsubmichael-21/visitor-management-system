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
  styleUrls: ['./confirm-dialog.component.scss'],
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: DialogRef<boolean>,
    @Inject(DIALOG_DATA) public data: ConfirmDialogData
  ) {}
}
