export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  fullName: string;
  email: string;
  role: UserRole;
  userId: number;
  employeeId?: number;
  visitorId?: number;
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  employeeId?: number;
  employeeName?: string;
  visitorId?: number;
  visitorName?: string;
  lastLogin?: string;
  createdAt: string;
  firstName?: string;
  lastName?: string;
}

export type UserRole = 'Admin' | 'CEO' | 'DepartmentHead' | 'Employee' | 'Receptionist' | 'Security';

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface JwtPayload {
  sub: number;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  iat: number;
  exp: number;
}
