import { Injectable, inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const token = this.authService.getToken();
    if (!token) {
      return this.router.createUrlTree(['/auth/login']);
    }

    try {
      const payload = this.authService.decodeToken(token);
      if (payload.exp * 1000 < Date.now()) {
        this.authService.logout();
        return this.router.createUrlTree(['/auth/login']);
      }

      const allowedRoles: UserRole[] = route.data['roles'] as UserRole[];
      if (!allowedRoles || allowedRoles.length === 0) {
        return true;
      }

      const userRole = payload.role as UserRole;
      if (allowedRoles.includes(userRole)) {
        return true;
      }

      return this.router.createUrlTree([this.getDashboardPath(userRole)]);
    } catch {
      this.authService.logout();
      return this.router.createUrlTree(['/auth/login']);
    }
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
