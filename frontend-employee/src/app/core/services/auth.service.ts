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
    const storedUser = localStorage.getItem(this.userKey);
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
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
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private setToken(token: string): void {
  console.log("SET TOKEN CALLED");
  console.log("TOKEN VALUE:", token);
  console.log("TOKEN KEY:", this.tokenKey);

  localStorage.setItem(this.tokenKey, token);

  console.log(
    "AFTER SAVE:",
    localStorage.getItem(this.tokenKey)
  );
}

  private setUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
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
