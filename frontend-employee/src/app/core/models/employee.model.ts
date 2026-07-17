export interface Employee {
  id: number;
  fullName: string;
  phone: string;
  email: string;
  departmentId: number;
  departmentName?: string;
  position: string;
  officeNumber?: string;
  status: string;
  userId?: number;
  pendingAppointments: number;
  totalAppointments: number;
  createdAt: string;
}

export interface CreateEmployeeRequest {
  fullName: string;
  phone: string;
  email: string;
  departmentId: number;
  position: string;
  officeNumber?: string;
}

export interface EmployeeFilter {
  departmentId?: number;
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
