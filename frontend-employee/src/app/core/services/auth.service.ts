import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, User, JwtPayload, UserRole } from '../models/auth.model';
import { ApiResponse } from '../models/common.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private tokenKey = environment.tokenKey;
  private userKey = environment.userKey;
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) {
    const storedUser = sessionStorage.getItem(this.userKey);
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
    if (!this.isAuthenticated()) {
      this.clearSession();
    }
  }

  login(request: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.apiUrl}/auth/login`, request).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setToken(response.data.token);
          const parts = response.data.fullName.split(' ');
          const firstName = parts[0] || '';
          const lastName = parts.slice(1).join(' ') || '';
          const user: User = {
            id: response.data.userId,
            email: response.data.email,
            fullName: response.data.fullName,
            role: response.data.role,
            employeeId: response.data.employeeId,
            isActive: true,
            createdAt: new Date().toISOString(),
            firstName: parts[0] || '',
            lastName: parts.slice(1).join(' ') || ''
          };
          this.setUser(user);
          this.currentUserSubject.next(user);
        }
      })
    );
  }

  logout(): void {
    const token = this.getToken();
    const refreshToken = this.getRefreshToken();
    this.clearSession();
    localStorage.clear();
    try {
      sessionStorage.clear();
    } catch {}
    if (token) {
      fetch(`${this.apiUrl}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ refreshToken }),
      }).catch(() => {});
    }
    this.router.navigate(['/auth/login']);
  }

  clearSession(): void {
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
  }

  async validateSession(): Promise<boolean> {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    try {
      const res = await fetch(`${this.apiUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401 || res.status === 403) {
        this.clearSession();
        return false;
      }
      if (!res.ok) {
        return true;
      }
      const body = (await res.json()) as ApiResponse<LoginResponse>;
      const data = body?.data;
      if (data && data.userId) {
        const parts = (data.fullName || '').split(' ');
        const user: User = {
          id: data.userId,
          email: data.email,
          fullName: data.fullName,
          role: data.role,
          employeeId: data.employeeId,
          isActive: true,
          createdAt: new Date().toISOString(),
          firstName: parts[0] || '',
          lastName: parts.slice(1).join(' ') || ''
        };
        this.setUser(user);
        this.currentUserSubject.next(user);
        return true;
      }
      return true;
    } catch {
      return true;
    }
  }

  private getRefreshToken(): string {
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.toLowerCase().includes('refresh')) {
        return sessionStorage.getItem(key) || '';
      }
    }
    return '';
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.tokenKey);
  }

  private setToken(token: string): void {
    sessionStorage.setItem(this.tokenKey, token);
  }

  private setUser(user: User): void {
    sessionStorage.setItem(this.userKey, JSON.stringify(user));
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = this.decodeToken(token);
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  public get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getUserRole(): UserRole | null {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }

  decodeToken(token: string): JwtPayload {
  const payload = JSON.parse(atob(token.split('.')[1]));

  return {
    ...payload,
    role:
      payload.role ??
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
  };
}

  hasRole(roles: UserRole[]): boolean {
    const userRole = this.getUserRole();
    return userRole ? roles.includes(userRole) : false;
  }

  forgotPassword(email: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/auth/forgot-password`, { email });
  }

  changePassword(currentPassword: string, newPassword: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/auth/change-password`, {
      currentPassword,
      newPassword
    });
  }
}
