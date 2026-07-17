export type EmployeeStatus = 'Active' | 'Inactive' | 'OnLeave';

export interface Employee {
  id: number;
  fullName: string;
  phone: string;
  email: string;
  departmentId: number;
  departmentName?: string;
  position: string;
  officeNumber: string | null;
  status: EmployeeStatus;
  createdAt: string;
  updatedAt: string | null;
}

export interface EmployeeCreate {
  fullName: string;
  phone: string;
  email: string;
  departmentId: number;
  position: string;
  officeNumber?: string;
  status?: EmployeeStatus;
}

export interface EmployeeUpdate extends EmployeeCreate {}
