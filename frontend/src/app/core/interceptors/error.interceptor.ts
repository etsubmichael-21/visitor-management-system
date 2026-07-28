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
        let friendlyMessage = 'An unexpected error occurred. Please try again.';

        if (error.status === 0) {
          friendlyMessage = 'Unable to connect to the server. Please check your connection and try again.';
        } else if (error.status === 401) {
          this.auth.logout();
          this.router.navigate(['/auth/login']);
          friendlyMessage = 'Your session has expired. Please log in again.';
        } else if (error.status === 403) {
          this.router.navigate(['/']);
          friendlyMessage = 'You do not have permission to access this resource.';
        } else if (error.status === 404) {
          friendlyMessage = 'The requested resource was not found.';
        } else if (error.status >= 500) {
          friendlyMessage = 'A server error occurred. Please try again later.';
        }

        return throwError(() => ({ status: error.status, message: friendlyMessage }));
      })
    );
  }
}
