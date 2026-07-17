namespace EcxVisitorManagement.Models;

public enum UserRole { Admin, CEO, DepartmentHead, Employee, Receptionist, Security, Visitor }
public enum EmployeeStatus { Active, Inactive, OnLeave }
public enum VisitStatus { Scheduled, CheckedIn, CheckedOut, Cancelled }
public enum AppointmentStatus { Pending, Approved, Rejected, Cancelled, Completed, EmployeeUnavailable, Rescheduled, Delegated }
public enum NotificationType { Info, Warning, Reminder, Alert }
public enum NotificationPriority { Low, Normal, High, Urgent }
public enum QueueStatus { Pending, Sent, Failed, Cancelled }
public enum NotificationChannel { InApp, Email, SMS, All }
public enum UnavailabilityType { AnnualLeave, MedicalLeave, BusinessTravel, Resignation, Suspension, Other }
public enum RescheduleStatus { Pending, Approved, Rejected, Expired }
