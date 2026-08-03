import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/common.model';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
} from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiService);
  private storage = inject(StorageService);
  private router = inject(Router);

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  private tokenKey = 'ecx_visitor_token';
  private refreshTokenKey = 'ecx_visitor_refresh_token';
  private userKey = 'ecx_visitor_user';

  constructor() {
    this.loadStoredUser();
    if (this.isTokenExpired()) {
      this.clearSession();
    }
  }

  get isLoggedIn(): boolean {
    return !!this.getToken();
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.currentUser;
    if (!user) return false;
    return roles.includes(user.role);
  }

  get token(): string | null {
    return this.storage.get(this.tokenKey);
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('/auth/login', credentials).pipe(
      map((res) => res.data),
      tap((response) => {
        this.storage.set(this.tokenKey, response.token);
        this.storage.set(this.refreshTokenKey, response.refreshToken);
        const parts = (response.fullName || '').split(' ');
        const firstName = parts[0] || '';
        const lastName = parts.slice(1).join(' ') || '';
        const user: User = {
          id: response.userId,
          email: response.email,
          fullName: response.fullName,
          firstName,
          lastName,
          role: response.role,
          visitorId: response.visitorId,
          isActive: true
        };
        this.storage.set(this.userKey, JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  register(data: RegisterRequest): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('/auth/register-visitor', data).pipe(
      map((res) => res.data),
      tap((response) => {
        this.storage.set(this.tokenKey, response.token);
        this.storage.set(this.refreshTokenKey, response.refreshToken);
        const parts = (response.fullName || '').split(' ');
        const firstName = parts[0] || '';
        const lastName = parts.slice(1).join(' ') || '';
        const user: User = {
          id: response.userId,
          email: response.email,
          fullName: response.fullName,
          firstName,
          lastName,
          role: response.role,
          visitorId: response.visitorId,
          isActive: true
        };
        this.storage.set(this.userKey, JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  logout(): void {
    const token = this.getToken();
    const refreshToken = this.storage.get(this.refreshTokenKey);
    this.clearSession();
    this.storage.clear();
    try {
      sessionStorage.clear();
    } catch {}
    if (token && refreshToken) {
      fetch(`${environment.apiUrl}/auth/logout`, {
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
    this.storage.remove(this.tokenKey);
    this.storage.remove(this.refreshTokenKey);
    this.storage.remove(this.userKey);
    this.currentUserSubject.next(null);
  }

  async validateSession(): Promise<boolean> {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    try {
      const res = await fetch(`${environment.apiUrl}/auth/me`, {
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
        const user = this.buildUser(data);
        this.storage.set(this.userKey, JSON.stringify(user));
        this.currentUserSubject.next(user);
        return true;
      }
      return true;
    } catch {
      return true;
    }
  }

  forgotPassword(data: ForgotPasswordRequest): Observable<unknown> {
    return this.api.post('/auth/forgot-password', data).pipe(map((res) => res.data));
  }

  resetPassword(data: ResetPasswordRequest): Observable<unknown> {
    return this.api.post('/auth/reset-password', data).pipe(map((res) => res.data));
  }

  changePassword(data: ChangePasswordRequest): Observable<unknown> {
    return this.api.post('/auth/change-password', data).pipe(map((res) => res.data));
  }

  refreshToken(): Observable<LoginResponse> {
    const refreshToken = this.storage.get(this.refreshTokenKey);
    return this.api.post<LoginResponse>('/auth/refresh-token', { refreshToken }).pipe(
      map((res) => res.data),
      tap((response) => {
        this.storage.set(this.tokenKey, response.token);
        this.storage.set(this.refreshTokenKey, response.refreshToken);
        const parts = (response.fullName || '').split(' ');
        const firstName = parts[0] || '';
        const lastName = parts.slice(1).join(' ') || '';
        const user: User = {
          id: response.userId,
          email: response.email,
          fullName: response.fullName,
          firstName,
          lastName,
          role: response.role,
          visitorId: response.visitorId,
          isActive: true
        };
        this.storage.set(this.userKey, JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  getToken(): string | null {
    return this.storage.get(this.tokenKey);
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  private buildUser(response: LoginResponse): User {
    const parts = (response.fullName || '').split(' ');
    return {
      id: response.userId,
      email: response.email,
      fullName: response.fullName,
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ') || '',
      role: response.role,
      visitorId: response.visitorId,
      isActive: true,
    };
  }

  private loadStoredUser(): void {
    const userJson = this.storage.get(this.userKey);
    if (userJson) {
      try {
        this.currentUserSubject.next(JSON.parse(userJson));
      } catch {
        this.storage.remove(this.userKey);
      }
    }
  }
}
