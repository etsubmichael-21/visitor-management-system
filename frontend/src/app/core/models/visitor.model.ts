export interface Visitor {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  nationalId?: string;
  organization?: string;
  gender?: string;
  photoUrl?: string;
  isActive: boolean;
  totalVisits: number;
  totalAppointments: number;
  createdAt: string;
  updatedAt: string;
}

export interface VisitorCreate {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  nationalId?: string;
  organization?: string;
  gender?: string;
}

export interface VisitorProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  photoUrl?: string;
  address?: string;
  nationalId?: string;
  organization?: string;
  gender?: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  phone?: string;
  address?: string;
  nationalId?: string;
  organization?: string;
  gender?: string;
}

export interface VisitorStats {
  totalAppointments: number;
  pendingAppointments: number;
  approvedAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  upcomingAppointments: number;
  totalVisits: number;
}
