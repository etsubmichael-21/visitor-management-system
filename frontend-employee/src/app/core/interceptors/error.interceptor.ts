import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        localStorage.clear();
        router.navigate(['/auth/login']);
      } else if (error.status === 403) {
        console.error('Access denied: You do not have permission to perform this action.');
      } else if (error.status === 404) {
        console.error('Resource not found.');
      } else if (error.status === 500) {
        console.error('Server error. Please try again later.');
      } else if (error.status === 0) {
        console.error('Unable to connect to server. Please check your connection.');
      }

      return throwError(() => error);
    })
  );
};
