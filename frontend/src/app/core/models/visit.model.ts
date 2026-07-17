export type VisitStatus = 'Scheduled' | 'CheckedIn' | 'CheckedOut' | 'Cancelled';

export interface Visit {
  id: number;
  visitorId: number;
  visitorName?: string;
  visitorPhone?: string;
  visitorEmail?: string;
  visitorPhotoUrl?: string;
  employeeId: number;
  employeeName?: string;
  departmentName?: string;
  appointmentId?: number;
  appointment?: any;
  purpose: string;
  visitDate: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: VisitStatus;
  badgeNumber: string | null;
  securityOfficer: string | null;
  remark: string | null;
  isDestinationKnown: boolean;
  redirectNote?: string;
  visitorItems: any[];
  allItemsVerified: boolean;
  createdAt: string;
}

export interface VisitCreate {
  visitorId: number;
  employeeId: number;
  purpose: string;
  visitDate?: string;
  status?: VisitStatus;
}

export interface CheckInRequest {
  visitorId: number;
  employeeId: number;
  purpose: string;
  badgeNumber?: string;
  securityOfficer?: string;
}

export interface CheckOutRequest {
  remark?: string;
}
