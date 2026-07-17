export interface Visit {
  id: number;
  visitorId: number;
  visitorName: string;
  visitorPhone?: string;
  visitorEmail?: string;
  visitorPhotoUrl?: string;
  employeeId: number;
  employeeName: string;
  departmentName: string;
  appointmentId?: number;
  appointment?: any;
  purpose: string;
  visitDate: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: VisitStatus;
  badgeNumber?: string;
  securityOfficer?: string;
  remark?: string;
  isDestinationKnown: boolean;
  redirectNote?: string;
  visitorItems: string;
  allItemsVerified: boolean;
  createdAt: string;
}

export type VisitStatus = 'Scheduled' | 'CheckedIn' | 'CheckedOut' | 'Cancelled';

export interface CheckInRequest {
  appointmentId?: number;
  visitorName: string;
  visitorEmail?: string;
  visitorPhone?: string;
  visitorCompany?: string;
  visitorIdNumber: string;
  hostEmployeeId: number;
  departmentId: number;
  purpose: string;
  badgeNumber?: string;
  parkingSpot?: string;
  itemsCarried?: string;
  photoUrl?: string;
  floor?: string;
  room?: string;
  notes?: string;
}

export interface CheckOutRequest {
  securityOfficer: string;
  remark?: string;
}

export interface VisitFilter {
  status?: VisitStatus;
  departmentId?: number;
  hostEmployeeId?: number;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
