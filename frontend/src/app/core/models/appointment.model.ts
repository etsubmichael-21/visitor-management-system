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
  attachments: any[];
  commentCount: number;
  createdAt: string;
  updatedAt?: string;
}

export type AppointmentStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Cancelled'
  | 'Completed'
  | 'EmployeeUnavailable'
  | 'Rescheduled'
  | 'Delegated';

export interface AppointmentRequest {
  visitorId?: number;
  employeeId: string;
  requestedDate: string;
  requestedStartTime: string;
  requestedEndTime?: string;
  purpose: string;
  isConfidential?: boolean;
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
