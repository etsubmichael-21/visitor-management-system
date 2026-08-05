export interface Appointment {
  id: number;
  visitorId: number;
  visitorName: string;
  visitorEmail: string;
  visitorPhone: string;
  visitorCompany?: string;
  employeeId: number;
  employeeName: string;
  employeePosition: string;
  departmentId: number;
  departmentName: string;
  requestedDate: string;
  requestedStartTime: string;
  requestedEndTime: string;
  purpose: string;
  status: AppointmentStatus;
  checkInAllowed: boolean;
  visitCheckInTime?: string;
  visitCheckOutTime?: string;
  badgeNumber?: string;
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
  propertyAuthorizationLetter?: PropertyAuthorizationLetter | null;
  properties?: AppointmentProperty[];
  hasProperties?: boolean;
  allPropertiesVerified?: boolean;
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

export interface PropertyAuthorizationLetter {
  fileName: string;
  originalFileName: string;
  filePath: string;
  fileSize: number;
  contentType: string;
  uploadedAt?: string;
}

export interface AppointmentProperty {
  id: number;
  propertyName?: string;
  propertyType: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  assetTagNumber?: string;
  quantity: number;
  description?: string;
  isVerified: boolean;
  verificationStatus?: string;
  verifiedAt?: string;
  verifiedByUserName?: string;
}

export interface PropertyVerificationItem {
  id?: number;
  propertyType: string;
  propertyName?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  quantity: number;
  verificationStatus: string;
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
