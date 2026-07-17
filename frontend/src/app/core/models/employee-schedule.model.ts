export interface EmployeeSchedule {
  id: number;
  employeeId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  breakStart: string | null;
  breakEnd: string | null;
  isAvailable: boolean;
  maxAppointments: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface EmployeeScheduleCreate {
  employeeId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
  isAvailable?: boolean;
  maxAppointments?: number;
  notes?: string;
}

export interface EmployeeScheduleUpdate extends EmployeeScheduleCreate {}
