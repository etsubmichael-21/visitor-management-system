namespace EcxVisitorManagement.DTOs.Reports;

public class ReportFilterDto
{
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public int? DepartmentId { get; set; }
    public string? Status { get; set; }
    public string? Search { get; set; }
}

public class VisitorReportDto
{
    public int TotalVisitors { get; set; }
    public int NewVisitors { get; set; }
    public int ReturningVisitors { get; set; }
    public List<VisitorReportItemDto> Items { get; set; } = new();
}

public class VisitorReportItemDto
{
    public int VisitorId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? Organization { get; set; }
    public int VisitCount { get; set; }
    public DateTime LastVisitDate { get; set; }
}

public class AppointmentReportDto
{
    public int TotalAppointments { get; set; }
    public int PendingCount { get; set; }
    public int ApprovedCount { get; set; }
    public int RejectedCount { get; set; }
    public int CompletedCount { get; set; }
    public int CancelledCount { get; set; }
    public List<AppointmentReportItemDto> Items { get; set; } = new();
}

public class AppointmentReportItemDto
{
    public int AppointmentId { get; set; }
    public string AppointmentCode { get; set; } = string.Empty;
    public string VisitorName { get; set; } = string.Empty;
    public string EmployeeName { get; set; } = string.Empty;
    public string DepartmentName { get; set; } = string.Empty;
    public string Purpose { get; set; } = string.Empty;
    public DateOnly RequestedDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class DepartmentReportDto
{
    public int DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public int TotalAppointments { get; set; }
    public int EmployeeCount { get; set; }
    public int PendingApprovals { get; set; }
    public int CompletedVisits { get; set; }
}

public class EmployeeReportDto
{
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string DepartmentName { get; set; } = string.Empty;
    public int TotalAppointments { get; set; }
    public int PendingAppointments { get; set; }
    public int CompletedAppointments { get; set; }
    public int TotalVisitsHosted { get; set; }
}
