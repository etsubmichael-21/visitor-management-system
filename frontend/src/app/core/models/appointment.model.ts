export interface Appointment {
  id: string;
  visitorId: string;
  visitorName?: string;
  visitorEmail?: string;
  visitorPhone?: string;
  employeeId: string;
  employeeName?: string;
  employeePosition?: string;
  departmentName?: string;
  requestedDate: string;
  requestedStartTime: string;
  requestedEndTime: string;
  purpose: string;
  status: AppointmentStatus;
  employeeResponse?: string;
  approvalDate?: string;
  checkInAllowed: boolean;
  isConfidential: boolean;
  appointmentCode?: string;
  rejectionReason?: string;
  notes?: string;
  delegatedToEmployeeId?: string;
  delegatedToEmployeeName?: string;
  originalEmployeeId?: string;
  originalEmployeeName?: string;
  assignedDepartmentId?: string;
  assignedDepartmentName?: string;
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  redirectedFromDepartmentId?: string;
  redirectedFromDepartmentName?: string;
  redirectReason?: string;
  attachments: any[];
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

export type AppointmentStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Cancelled'
  | 'Completed'
  | 'EmployeeUnavailable'
  | 'Rescheduled'
  | 'Delegated'
  | 'PendingAssignment';

export interface AppointmentRequest {
  visitorId?: number;
  employeeId: number;
  requestedDate: string;
  requestedStartTime: string;
  requestedEndTime?: string;
  purpose: string;
  isConfidential?: boolean;
  routeType?: string;
  appointmentMethod?: string;
  notes?: string;
}

export interface RescheduleRequest {
  newDate: string;
  newStartTime: string;
  newEndTime: string;
  reason?: string;
}

export interface AppointmentQuery {
  page?: number;
  pageSize?: number;
  status?: AppointmentStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
}
