export interface EmployeeUnavailability {
  id: number;
  employeeId: number;
  employeeName: string;
  unavailabilityType: string;
  startDate: string;
  endDate?: string;
  reason?: string;
  createdAt: string;
}

export interface CreateUnavailabilityRequest {
  employeeId: number;
  unavailabilityType: string;
  startDate: string;
  endDate?: string;
  reason?: string;
}
