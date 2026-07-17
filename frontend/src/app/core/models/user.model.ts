export type UserRole = 'Admin' | 'Receptionist' | 'Security' | 'Visitor';

export interface User {
  id: number;
  fullName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface UserCreate {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
}

export interface UserUpdate {
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
