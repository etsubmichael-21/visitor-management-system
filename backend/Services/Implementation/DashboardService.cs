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
    private readonly ILogger<DashboardService> _logger;
    public DashboardService(AppDbContext context, ILogger<DashboardService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<DashboardStatsDto> GetStatsAsync()
    {
        var today = DateOnly.FromDateTime(DateTime.Now);
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
        var today = DateOnly.FromDateTime(DateTime.Now);
        var monthStart = new DateOnly(today.Year, today.Month, 1);
        return new CeoDashboardDto
        {
            TotalAppointments = await _context.Appointments.CountAsync(a => a.RequestedDate >= monthStart),
            ConfidentialAppointments = await _context.Appointments.CountAsync(a => a.IsConfidential && a.RequestedDate >= monthStart),
            PendingActions = await _context.Appointments.CountAsync(a => a.Status == "Pending"),
            ApprovedThisMonth = await _context.Appointments.CountAsync(a => a.Status == "Approved" && a.ApprovalDate >= new DateTimeOffset(monthStart.ToDateTime(TimeOnly.MinValue), TimeSpan.Zero)),
            RejectedThisMonth = await _context.Appointments.CountAsync(a => a.Status == "Rejected" && a.ApprovalDate >= new DateTimeOffset(monthStart.ToDateTime(TimeOnly.MinValue), TimeSpan.Zero))
        };
    }

    public async Task<DepartmentHeadDashboardDto> GetDepartmentHeadDashboardAsync(int departmentId)
    {
        var today = DateOnly.FromDateTime(DateTime.Now);
        var weekStart = today.AddDays(-(int)today.DayOfWeek);
        var monthStart = new DateOnly(today.Year, today.Month, 1);

        var dept = await _context.Departments.FindAsync(departmentId);

        var awaitingAssignment = await _context.Appointments
            .CountAsync(a => a.Status == "Pending" && a.AssignedEmployeeId == null
                && (a.AssignedDepartmentId == departmentId
                    || (a.AssignedDepartmentId == null && a.Employee.DepartmentId == departmentId)));

        var assignedPending = await _context.Appointments
            .CountAsync(a => a.Status == "Pending" && a.AssignedEmployeeId != null
                && (a.AssignedDepartmentId == departmentId
                    || (a.AssignedDepartmentId == null && a.Employee.DepartmentId == departmentId)));

        var approvedThisWeek = await _context.Appointments
            .CountAsync(a => a.Status == "Approved" && a.ApprovalDate >= new DateTimeOffset(weekStart.ToDateTime(TimeOnly.MinValue), TimeSpan.Zero)
                && (a.AssignedDepartmentId == departmentId
                    || (a.AssignedDepartmentId == null && a.Employee.DepartmentId == departmentId)));

        var totalVisitorsThisMonth = await _context.Appointments
            .CountAsync(a => a.RequestedDate >= monthStart && a.RequestedDate <= today
                && (a.AssignedDepartmentId == departmentId
                    || (a.AssignedDepartmentId == null && a.Employee.DepartmentId == departmentId)));

        var pendingAppointments = await _context.Appointments
            .Include(a => a.Visitor)
            .Include(a => a.Employee).ThenInclude(e => e.Department)
            .Include(a => a.AssignedEmployee).ThenInclude(e => e.Department)
            .Where(a => a.Status == "Pending"
                && (a.AssignedDepartmentId == departmentId
                    || (a.AssignedDepartmentId == null && a.Employee.DepartmentId == departmentId)))
            .OrderByDescending(a => a.CreatedAt)
            .Take(20)
            .Select(a => new AppointmentResponseDto
            {
                Id = a.Id,
                VisitorId = a.VisitorId,
                VisitorName = a.Visitor.FullName,
                EmployeeId = a.EmployeeId,
                EmployeeName = a.Employee.FullName,
                DepartmentName = a.Employee.Department.Name,
                Purpose = a.Purpose,
                Status = a.Status,
                RequestedDate = a.RequestedDate,
                RequestedStartTime = a.RequestedStartTime,
                RequestedEndTime = a.RequestedEndTime,
                CheckInAllowed = a.CheckInAllowed,
                IsConfidential = a.IsConfidential,
                AppointmentCode = a.AppointmentCode,
                Notes = a.Notes,
                AssignedEmployeeId = a.AssignedEmployeeId,
                AssignedEmployeeName = a.AssignedEmployee != null ? a.AssignedEmployee.FullName : null,
                AssignedDepartmentId = a.AssignedDepartmentId,
                AssignedDepartmentName = a.AssignedDepartment != null ? a.AssignedDepartment.Name : null,
                CreatedAt = a.CreatedAt
            }).ToListAsync();

        _logger.LogInformation("[Dashboard:DepartmentHead] DepartmentId={DepartmentId} DepartmentName={DepartmentName} AwaitingAssignment={Awaiting} AssignedPending={AssignedPending} ApprovedThisWeek={ApprovedWeek} VisitorsThisMonth={VisitorsMonth}",
            departmentId, dept?.Name ?? "", awaitingAssignment, assignedPending, approvedThisWeek, totalVisitorsThisMonth);

        return new DepartmentHeadDashboardDto
        {
            DepartmentId = departmentId,
            DepartmentName = dept?.Name ?? "",
            TotalEmployees = await _context.Employees.CountAsync(e => e.DepartmentId == departmentId),
            PendingAppointments = awaitingAssignment,
            AssignedPendingAppointments = assignedPending,
            ApprovedThisWeek = approvedThisWeek,
            TotalVisitorsThisMonth = totalVisitorsThisMonth,
            PendingAppointmentsList = pendingAppointments
        };
    }

    public async Task<EmployeeDashboardDto> GetEmployeeDashboardAsync(int employeeId)
    {
        var today = DateOnly.FromDateTime(DateTime.Now);

        var todayAppointments = await _context.Appointments
            .Include(a => a.Visitor)
            .Include(a => a.Employee).ThenInclude(e => e.Department)
            .Where(a => a.EmployeeId == employeeId && a.RequestedDate == today)
            .OrderBy(a => a.RequestedStartTime)
            .Select(a => new AppointmentResponseDto
            {
                Id = a.Id, VisitorId = a.VisitorId, VisitorName = a.Visitor.FullName,
                EmployeeId = a.EmployeeId, EmployeeName = a.Employee.FullName,
                DepartmentName = a.Employee.Department.Name, Purpose = a.Purpose,
                Status = a.Status, RequestedDate = a.RequestedDate,
                RequestedStartTime = a.RequestedStartTime, RequestedEndTime = a.RequestedEndTime,
                CheckInAllowed = a.CheckInAllowed, IsConfidential = a.IsConfidential,
                AppointmentCode = a.AppointmentCode, Notes = a.Notes, CreatedAt = a.CreatedAt
            }).ToListAsync();

        var upcomingAppointments = await _context.Appointments
            .Include(a => a.Visitor)
            .Include(a => a.Employee).ThenInclude(e => e.Department)
            .Where(a => a.EmployeeId == employeeId && a.RequestedDate >= today && (a.Status == "Pending" || a.Status == "Approved"))
            .OrderBy(a => a.RequestedDate).ThenBy(a => a.RequestedStartTime)
            .Select(a => new AppointmentResponseDto
            {
                Id = a.Id, VisitorId = a.VisitorId, VisitorName = a.Visitor.FullName,
                EmployeeId = a.EmployeeId, EmployeeName = a.Employee.FullName,
                DepartmentName = a.Employee.Department.Name, Purpose = a.Purpose,
                Status = a.Status, RequestedDate = a.RequestedDate,
                RequestedStartTime = a.RequestedStartTime, RequestedEndTime = a.RequestedEndTime,
                CheckInAllowed = a.CheckInAllowed, IsConfidential = a.IsConfidential,
                AppointmentCode = a.AppointmentCode, Notes = a.Notes, CreatedAt = a.CreatedAt
            }).ToListAsync();

        return new EmployeeDashboardDto
        {
            EmployeeId = employeeId,
            PendingAppointments = await _context.Appointments.CountAsync(a => a.EmployeeId == employeeId && a.Status == "Pending"),
            ApprovedAppointments = await _context.Appointments.CountAsync(a => a.EmployeeId == employeeId && a.Status == "Approved"),
            CompletedToday = await _context.Appointments.CountAsync(a => a.EmployeeId == employeeId && a.Status == "Completed" && a.RequestedDate == today),
            TodayAppointments = todayAppointments,
            UpcomingAppointments = upcomingAppointments
        };
    }

    public async Task<RoleDashboardDto> GetReceptionistDashboardAsync()
    {
        var today = DateOnly.FromDateTime(DateTime.Now);
        var stats = await GetStatsAsync();
        var todayAppointments = await GetTodayAppointmentsAsync(today);
        var activeVisitors = await GetActiveVisitorsAsync();
        var hourlyTraffic = await GetHourlyTrafficAsync(today);
        _logger.LogInformation("[Dashboard:Receptionist] ServerLocalDate={Today} TodayAppointments={Count} ActiveVisitors={Active} TotalVisitorsToday={Total} PendingAppointments={Pending}",
            today, todayAppointments.Count, activeVisitors.Count, stats.TotalVisitorsToday, stats.PendingAppointments);
        return new RoleDashboardDto
        {
            Stats = stats,
            TodayAppointments = todayAppointments,
            ActiveVisitors = activeVisitors,
            HourlyTraffic = hourlyTraffic
        };
    }

    public async Task<RoleDashboardDto> GetSecurityDashboardAsync()
    {
        var today = DateOnly.FromDateTime(DateTime.Now);
        var stats = await GetStatsAsync();
        var todayAppointments = await GetTodayAppointmentsAsync(today);
        var activeVisitors = await GetActiveVisitorsAsync();
        var hourlyTraffic = await GetHourlyTrafficAsync(today);
        return new RoleDashboardDto
        {
            Stats = stats,
            TodayAppointments = todayAppointments,
            ActiveVisitors = activeVisitors,
            HourlyTraffic = hourlyTraffic
        };
    }

    private async Task<List<TodayAppointmentDto>> GetTodayAppointmentsAsync(DateOnly day)
    {
        return await _context.Appointments
            .Include(a => a.Visitor)
            .Include(a => a.Employee).ThenInclude(e => e.Department)
            .Where(a => a.RequestedDate == day)
            .OrderBy(a => a.RequestedStartTime)
            .Select(a => new TodayAppointmentDto
            {
                Id = a.Id,
                VisitorName = a.Visitor.FullName,
                HostName = a.Employee.FullName,
                Time = a.RequestedStartTime.ToString("HH:mm"),
                Status = a.Status,
                Department = a.Employee.Department.Name,
                Purpose = a.Purpose
            }).ToListAsync();
    }

    private async Task<List<ActiveVisitorDto>> GetActiveVisitorsAsync()
    {
        return await _context.Visits
            .Include(v => v.Visitor)
            .Include(v => v.Employee).ThenInclude(e => e.Department)
            .Where(v => v.Status == "CheckedIn")
            .OrderBy(v => v.CheckInTime)
            .Select(v => new ActiveVisitorDto
            {
                Id = v.Id,
                VisitorName = v.Visitor.FullName,
                HostName = v.Employee.FullName,
                CheckInTime = v.CheckInTime != null ? v.CheckInTime.Value.ToString("hh:mm tt") : "",
                BadgeNumber = v.BadgeNumber ?? "",
                Department = v.Employee.Department.Name,
                Floor = v.Employee.OfficeNumber ?? ""
            }).ToListAsync();
    }

    private async Task<List<HourlyTrafficDto>> GetHourlyTrafficAsync(DateOnly day)
    {
        var visits = await _context.Visits
            .Where(v => v.VisitDate == day && v.CheckInTime != null)
            .Select(v => v.CheckInTime!.Value)
            .ToListAsync();
        return Enumerable.Range(0, 24)
            .Select(h => new HourlyTrafficDto
            {
                Hour = $"{(h % 12 == 0 ? 12 : h % 12)}{(h < 12 ? "AM" : "PM")}",
                Count = visits.Count(v => v.Hour == h)
            })
            .ToList();
    }

    public async Task<VisitorDashboardDto> GetVisitorDashboardAsync(int visitorId)
    {
        var today = DateOnly.FromDateTime(DateTime.Now);
        var appointments = await _context.Appointments
            .Where(a => a.VisitorId == visitorId)
            .Include(a => a.Employee).ThenInclude(e => e.Department)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();

        var recentAppointments = appointments.Take(5).Select(a => new AppointmentResponseDto
        {
            Id = a.Id,
            VisitorId = a.VisitorId,
            EmployeeId = a.EmployeeId,
            EmployeeName = a.Employee.FullName,
            DepartmentName = a.Employee.Department.Name,
            Purpose = a.Purpose,
            Status = a.Status,
            RequestedDate = a.RequestedDate,
            RequestedStartTime = a.RequestedStartTime,
            RequestedEndTime = a.RequestedEndTime,
            CheckInAllowed = a.CheckInAllowed,
            IsConfidential = a.IsConfidential,
            AppointmentCode = a.AppointmentCode,
            Notes = a.Notes,
            CreatedAt = a.CreatedAt
        }).ToList();

        return new VisitorDashboardDto
        {
            TotalAppointments = appointments.Count,
            PendingAppointments = appointments.Count(a => a.Status == "Pending"),
            ApprovedAppointments = appointments.Count(a => a.Status == "Approved"),
            CompletedAppointments = appointments.Count(a => a.Status == "Completed"),
            CancelledAppointments = appointments.Count(a => a.Status == "Cancelled" || a.Status == "Rejected"),
            UpcomingAppointments = appointments.Count(a => a.Status == "Approved" && a.RequestedDate >= today),
            TotalVisits = await _context.Visits.CountAsync(v => v.VisitorId == visitorId),
            RecentAppointments = recentAppointments
        };
    }
}
