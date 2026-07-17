export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  fullName: string;
  email: string;
  role: string;
  userId: number;
  visitorId?: number;
  employeeId?: number;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  address?: string;
  nationalId?: string;
  organization?: string;
  gender?: string;
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  firstName: string;
  lastName: string;
  role: string;
  visitorId?: number;
  isActive: boolean;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}
