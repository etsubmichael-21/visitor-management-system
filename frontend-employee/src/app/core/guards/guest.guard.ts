import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class GuestGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(): boolean | UrlTree {
    if (!this.authService.isAuthenticated()) {
      return true;
    }

    const role = this.authService.getUserRole();
    if (role) {
      return this.router.createUrlTree([this.getDashboardPath(role)]);
    }
    return this.router.createUrlTree(['/auth/login']);
  }

  private getDashboardPath(role: UserRole): string {
    switch (role) {
      case 'Admin': return '/admin/dashboard';
      case 'CEO': return '/ceo/dashboard';
      case 'DepartmentHead': return '/dept/dashboard';
      case 'Employee': return '/emp/dashboard';
      case 'Receptionist': return '/reception/dashboard';
      case 'Security': return '/security/dashboard';
      default: return '/auth/login';
    }
  }
}
