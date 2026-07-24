using EcxVisitorManagement.DTOs.Appointments;
using EcxVisitorManagement.DTOs.Visits;

namespace EcxVisitorManagement.DTOs.Dashboard;

public class DashboardStatsDto
{
    public int TotalVisitorsToday { get; set; }
    public int TotalVisitorsThisWeek { get; set; }
    public int TotalVisitorsThisMonth { get; set; }
    public int ActiveAppointments { get; set; }
    public int PendingAppointments { get; set; }
    public int CheckedInVisitors { get; set; }
    public int TotalEmployees { get; set; }
    public int TotalDepartments { get; set; }
    public int UnreadNotifications { get; set; }
}

public class AdminDashboardDto
{
    public DashboardStatsDto Stats { get; set; } = new();
    public List<RecentActivityDto> RecentActivities { get; set; } = new();
    public List<DepartmentChartDto> DepartmentDistribution { get; set; } = new();
    public List<AppointmentTrendDto> AppointmentTrends { get; set; } = new();
    public List<AppointmentResponseDto> RecentAppointments { get; set; } = new();
}

public class CeoDashboardDto
{
    public int TotalAppointments { get; set; }
    public int ConfidentialAppointments { get; set; }
    public int PendingActions { get; set; }
    public int ApprovedThisMonth { get; set; }
    public int RejectedThisMonth { get; set; }
    public List<DepartmentChartDto> DepartmentComparison { get; set; } = new();
    public List<AppointmentResponseDto> ConfidentialAppointmentsList { get; set; } = new();
    public List<AppointmentResponseDto> PendingAppointments { get; set; } = new();
}

public class DepartmentHeadDashboardDto
{
    public int DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public int TotalEmployees { get; set; }
    public int PendingAppointments { get; set; }
    public int ApprovedThisWeek { get; set; }
    public int TotalVisitorsThisMonth { get; set; }
    public List<AppointmentResponseDto> PendingAppointmentsList { get; set; } = new();
    public List<EmployeeAvailabilityDto> EmployeeAvailability { get; set; } = new();
}

public class EmployeeDashboardDto
{
    public int EmployeeId { get; set; }
    public int PendingAppointments { get; set; }
    public int ApprovedAppointments { get; set; }
    public int CompletedToday { get; set; }
    public int TotalThisWeek { get; set; }
    public List<AppointmentResponseDto> TodayAppointments { get; set; } = new();
    public List<AppointmentResponseDto> UpcomingAppointments { get; set; } = new();
}

public class ReceptionistDashboardDto
{
    public int TodayExpected { get; set; }
    public int CurrentlyOnPremises { get; set; }
    public int WalkInsToday { get; set; }
    public int PendingCheckIns { get; set; }
    public List<VisitResponseDto> CurrentVisitors { get; set; } = new();
    public List<AppointmentResponseDto> TodaysAppointments { get; set; } = new();
}

public class SecurityDashboardDto
{
    public int CurrentlyOnPremises { get; set; }
    public int CheckInsToday { get; set; }
    public int CheckOutsToday { get; set; }
    public int PendingCheckOuts { get; set; }
    public int PendingItemVerification { get; set; }
    public List<VisitResponseDto> ActiveVisits { get; set; } = new();
}

public class RecentActivityDto
{
    public string Action { get; set; } = string.Empty;
    public string EntityName { get; set; } = string.Empty;
    public int EntityId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
}

public class DepartmentChartDto
{
    public string DepartmentName { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class AppointmentTrendDto
{
    public string Date { get; set; } = string.Empty;
    public int Pending { get; set; }
    public int Approved { get; set; }
    public int Rejected { get; set; }
    public int Completed { get; set; }
}

public class EmployeeAvailabilityDto
{
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public bool IsAvailable { get; set; }
}

public class VisitorDashboardDto
{
    public int TotalAppointments { get; set; }
    public int PendingAppointments { get; set; }
    public int ApprovedAppointments { get; set; }
    public int CompletedAppointments { get; set; }
    public int CancelledAppointments { get; set; }
    public int UpcomingAppointments { get; set; }
    public int TotalVisits { get; set; }
    public List<AppointmentResponseDto> RecentAppointments { get; set; } = new();
}
