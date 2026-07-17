import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private router = inject(Router);
  private auth = inject(AuthService);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.auth.logout();
          this.router.navigate(['/auth/login']);
        } else if (error.status === 403) {
          this.router.navigate(['/']);
        } else if (error.status === 0) {
          console.error('Network error - backend may be offline');
        }

        const message = error.error?.message || error.message || 'An unexpected error occurred';
        return throwError(() => ({ status: error.status, message }));
      })
    );
  }
}
