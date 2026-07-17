export interface Department {
  id: number;
  name: string;
  description?: string;
  location?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  employeeCount: number;
  pendingAppointments: number;
  totalAppointmentsThisMonth: number;
  createdAt: string;
}

export interface CreateDepartmentRequest {
  name: string;
  description?: string;
  location?: string;
  phone?: string;
  email?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface ReportFilter {
  dateFrom: string;
  dateTo: string;
  departmentId?: number;
  reportType: 'visitors' | 'appointments' | 'departments' | 'employee-activity';
  format?: 'json' | 'csv' | 'pdf';
}

export interface ReportData {
  title: string;
  generatedAt: string;
  filters: ReportFilter;
  summary: Record<string, number>;
  details: any[];
  charts: {
    labels: string[];
    datasets: { label: string; data: number[] }[];
  };
}
