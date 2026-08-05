export interface EmployeeUnavailability {
  id: number;
  employeeId: number;
  employeeName: string;
  unavailabilityType: string;
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  repeat?: string;
  reason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateUnavailabilityRequest {
  employeeId: number;
  unavailabilityType: string;
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  repeat?: string;
  reason?: string;
}
