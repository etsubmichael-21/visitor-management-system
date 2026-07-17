import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastsSubject.asObservable();
  private counter = 0;

  showSuccess(message: string, duration = 4000): void {
    this.addToast({ type: 'success', message, duration });
  }

  showError(message: string, duration = 6000): void {
    this.addToast({ type: 'error', message, duration });
  }

  showWarning(message: string, duration = 4000): void {
    this.addToast({ type: 'warning', message, duration });
  }

  showInfo(message: string, duration = 3000): void {
    this.addToast({ type: 'info', message, duration });
  }

  remove(id: number): void {
    const current = this.toastsSubject.value;
    this.toastsSubject.next(current.filter((t) => t.id !== id));
  }

  private addToast(toast: Omit<Toast, 'id'>): void {
    const id = ++this.counter;
    const newToast: Toast = { ...toast, id };
    this.toastsSubject.next([...this.toastsSubject.value, newToast]);
    setTimeout(() => this.remove(id), toast.duration ?? 4000);
  }
}
