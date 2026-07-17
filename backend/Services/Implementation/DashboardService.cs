using Microsoft.EntityFrameworkCore;
using EcxVisitorManagement.Data;
using EcxVisitorManagement.DTOs.Appointments;
using EcxVisitorManagement.DTOs.Dashboard;
using EcxVisitorManagement.DTOs.Visits;
using EcxVisitorManagement.Interfaces;

namespace EcxVisitorManagement.Services.Implementation;

public class DashboardService : IDashboardService
{
    private readonly AppDbContext _context;
    public DashboardService(AppDbContext context) => _context = context;

    public async Task<DashboardStatsDto> GetStatsAsync()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var weekStart = today.AddDays(-(int)today.DayOfWeek);
        var monthStart = new DateOnly(today.Year, today.Month, 1);
        return new DashboardStatsDto
        {
            TotalVisitorsToday = await _context.Visits.CountAsync(v => v.VisitDate == today),
            TotalVisitorsThisWeek = await _context.Visits.CountAsync(v => v.VisitDate >= weekStart && v.VisitDate <= today),
            TotalVisitorsThisMonth = await _context.Visits.CountAsync(v => v.VisitDate >= monthStart && v.VisitDate <= today),
            ActiveAppointments = await _context.Appointments.CountAsync(a => a.Status == "Approved"),
            PendingAppointments = await _context.Appointments.CountAsync(a => a.Status == "Pending"),
            CheckedInVisitors = await _context.Visits.CountAsync(v => v.Status == "CheckedIn"),
            TotalEmployees = await _context.Employees.CountAsync(),
            TotalDepartments = await _context.Departments.CountAsync()
        };
    }

    public async Task<AdminDashboardDto> GetAdminDashboardAsync()
    {
        var stats = await GetStatsAsync();
        var recentActivities = await _context.AuditLogs.Include(a => a.User).OrderByDescending(a => a.CreatedAt).Take(10)
            .Select(a => new RecentActivityDto { Action = a.Action, EntityName = a.EntityName, EntityId = a.EntityId, UserName = a.User.FullName, CreatedAt = a.CreatedAt }).ToListAsync();
        var recentAppointments = await _context.Appointments.Include(a => a.Visitor).Include(a => a.Employee).ThenInclude(e => e.Department)
            .OrderByDescending(a => a.CreatedAt).Take(5).Select(a => new AppointmentResponseDto { Id = a.Id, VisitorName = a.Visitor.FullName, EmployeeName = a.Employee.FullName, Purpose = a.Purpose, Status = a.Status, RequestedDate = a.RequestedDate, CreatedAt = a.CreatedAt }).ToListAsync();
        return new AdminDashboardDto { Stats = stats, RecentActivities = recentActivities, RecentAppointments = recentAppointments };
    }

    public async Task<CeoDashboardDto> GetCeoDashboardAsync()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var monthStart = new DateOnly(today.Year, today.Month, 1);
        return new CeoDashboardDto
        {
            TotalAppointments = await _context.Appointments.CountAsync(a => a.RequestedDate >= monthStart),
            ConfidentialAppointments = await _context.Appointments.CountAsync(a => a.IsConfidential && a.RequestedDate >= monthStart),
            PendingActions = await _context.Appointments.CountAsync(a => a.Status == "Pending"),
            ApprovedThisMonth = await _context.Appointments.CountAsync(a => a.Status == "Approved" && a.ApprovalDate >= monthStart.ToDateTime(TimeOnly.MinValue)),
            RejectedThisMonth = await _context.Appointments.CountAsync(a => a.Status == "Rejected" && a.ApprovalDate >= monthStart.ToDateTime(TimeOnly.MinValue))
        };
    }

    public async Task<DepartmentHeadDashboardDto> GetDepartmentHeadDashboardAsync(int departmentId)
    {
        var dept = await _context.Departments.FindAsync(departmentId);
        return new DepartmentHeadDashboardDto
        {
            DepartmentId = departmentId, DepartmentName = dept?.Name ?? "",
            TotalEmployees = await _context.Employees.CountAsync(e => e.DepartmentId == departmentId),
            PendingAppointments = await _context.Appointments.CountAsync(a => a.Employee.DepartmentId == departmentId && a.Status == "Pending")
        };
    }

    public async Task<EmployeeDashboardDto> GetEmployeeDashboardAsync(int employeeId)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        return new EmployeeDashboardDto
        {
            EmployeeId = employeeId,
            PendingAppointments = await _context.Appointments.CountAsync(a => a.EmployeeId == employeeId && a.Status == "Pending"),
            ApprovedAppointments = await _context.Appointments.CountAsync(a => a.EmployeeId == employeeId && a.Status == "Approved"),
            CompletedToday = await _context.Appointments.CountAsync(a => a.EmployeeId == employeeId && a.Status == "Completed" && a.RequestedDate == today)
        };
    }

    public async Task<ReceptionistDashboardDto> GetReceptionistDashboardAsync()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        return new ReceptionistDashboardDto
        {
            TodayExpected = await _context.Appointments.CountAsync(a => a.RequestedDate == today && a.Status == "Approved"),
            CurrentlyOnPremises = await _context.Visits.CountAsync(v => v.Status == "CheckedIn"),
            WalkInsToday = await _context.Visits.CountAsync(v => v.VisitDate == today && v.AppointmentId == null),
            PendingCheckIns = await _context.Appointments.CountAsync(a => a.RequestedDate == today && a.Status == "Approved" && !a.CheckInAllowed)
        };
    }

    public async Task<SecurityDashboardDto> GetSecurityDashboardAsync()
    {
        return new SecurityDashboardDto
        {
            CurrentlyOnPremises = await _context.Visits.CountAsync(v => v.Status == "CheckedIn"),
            CheckInsToday = await _context.Visits.CountAsync(v => v.VisitDate == DateOnly.FromDateTime(DateTime.UtcNow) && v.CheckInTime != null),
            CheckOutsToday = await _context.Visits.CountAsync(v => v.VisitDate == DateOnly.FromDateTime(DateTime.UtcNow) && v.CheckOutTime != null),
            PendingCheckOuts = await _context.Visits.CountAsync(v => v.Status == "CheckedIn")
        };
    }
}
