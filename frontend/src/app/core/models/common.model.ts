export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  headEmployeeId?: string;
  headEmployeeName?: string;
  isActive: boolean;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  departmentId: string;
  departmentName?: string;
  jobTitle?: string;
  office?: string;
  floor?: string;
  isActive: boolean;
}
