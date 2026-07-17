import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean | UrlTree {
    const roles = route.data?.['roles'] as string[] ?? [];
    if (this.authService.hasAnyRole(roles)) {
      return true;
    }
    return this.router.parseUrl('/dashboard');
  }
}
