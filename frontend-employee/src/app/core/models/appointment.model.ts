export interface Appointment {
  id: number;
  visitorId: number;
  visitorName: string;
  visitorEmail: string;
  visitorPhone: string;
  employeeId: number;
  employeeName: string;
  employeePosition: string;
  departmentName: string;
  requestedDate: string;
  requestedStartTime: string;
  requestedEndTime: string;
  purpose: string;
  status: AppointmentStatus;
  checkInAllowed: boolean;
  isConfidential: boolean;
  appointmentCode?: string;
  rejectionReason?: string;
  notes?: string;
  delegatedToEmployeeId?: number;
  delegatedToEmployeeName?: string;
  assignedDepartmentId?: number;
  assignedDepartmentName?: string;
  assignedEmployeeId?: number;
  assignedEmployeeName?: string;
  redirectedFromDepartmentId?: number;
  redirectedFromDepartmentName?: string;
  redirectReason?: string;
  assignedBy?: number;
  assignedAt?: string;
  supportingLetter?: SupportingLetter | null;
  commentCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface SupportingLetter {
  fileName: string;
  originalFileName: string;
  filePath: string;
  fileSize: number;
  contentType: string;
  uploadedAt?: string;
}

export type AppointmentStatus = 'Pending' | 'PendingAssignment' | 'Approved' | 'Rejected' | 'Cancelled' | 'Completed' | 'EmployeeUnavailable' | 'Rescheduled' | 'Delegated';

export interface CreateAppointmentRequest {
  visitorId: number;
  employeeId: number;
  requestedDate: string;
  requestedStartTime: string;
  requestedEndTime: string;
  purpose: string;
  isConfidential: boolean;
  notes?: string;
}

export interface ApproveAppointmentRequest {
  appointmentId: number;
  notes?: string;
}

export interface RejectAppointmentRequest {
  appointmentId: number;
  reason: string;
}

export interface DelegateAppointmentRequest {
  appointmentId: number;
  delegateToEmployeeId: number;
  notes?: string;
}

export interface RedirectToDepartmentRequest {
  appointmentId: number;
  newDepartmentId: number;
  reason?: string;
}

export interface AssignEmployeeRequest {
  appointmentId: number;
  newEmployeeId: number;
  notes?: string;
}

export interface AppointmentFilter {
  status?: AppointmentStatus;
  departmentId?: number;
  employeeId?: number;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
