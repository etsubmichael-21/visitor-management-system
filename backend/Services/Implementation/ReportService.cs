using Microsoft.EntityFrameworkCore;
using EcxVisitorManagement.Data;
using EcxVisitorManagement.DTOs.Reports;
using EcxVisitorManagement.Interfaces;

namespace EcxVisitorManagement.Services.Implementation;

public class ReportService : IReportService
{
    private readonly AppDbContext _context;

    public ReportService(AppDbContext context) => _context = context;

    public async Task<VisitorReportDto> GetVisitorReportAsync(ReportFilterDto filter)
    {
        var query = _context.Visitors.AsQueryable();

        if (filter.StartDate.HasValue)
            query = query.Where(v => v.CreatedAt >= filter.StartDate.Value.ToDateTime(TimeOnly.MinValue));
        if (filter.EndDate.HasValue)
            query = query.Where(v => v.CreatedAt <= filter.EndDate.Value.ToDateTime(TimeOnly.MaxValue));
        if (!string.IsNullOrWhiteSpace(filter.Search))
            query = query.Where(v => v.FullName.Contains(filter.Search) || (v.Organization != null && v.Organization.Contains(filter.Search)));

        var visitors = await query.OrderByDescending(v => v.CreatedAt).ToListAsync();
        var totalVisitors = visitors.Count;
        var returnVisitorIds = await _context.Visits.GroupBy(v => v.VisitorId)
            .Where(g => g.Count() > 1).Select(g => g.Key).ToListAsync();
        var returningCount = visitors.Count(v => returnVisitorIds.Contains(v.Id));

        return new VisitorReportDto
        {
            TotalVisitors = totalVisitors,
            NewVisitors = totalVisitors - returningCount,
            ReturningVisitors = returningCount,
            Items = visitors.Select(v => new VisitorReportItemDto
            {
                VisitorId = v.Id,
                FullName = v.FullName,
                Organization = v.Organization,
                VisitCount = _context.Visits.Count(vis => vis.VisitorId == v.Id),
                LastVisitDate = _context.Visits.Where(vis => vis.VisitorId == v.Id)
                    .OrderByDescending(vis => vis.CheckInTime).Select(vis => vis.CheckInTime)
                    .FirstOrDefault().GetValueOrDefault().DateTime
            }).ToList()
        };
    }

    public async Task<AppointmentReportDto> GetAppointmentReportAsync(ReportFilterDto filter)
    {
        var query = _context.Appointments
            .Include(a => a.Visitor).Include(a => a.Employee).ThenInclude(e => e.Department)
            .AsQueryable();

        if (filter.StartDate.HasValue)
            query = query.Where(a => a.RequestedDate >= filter.StartDate.Value);
        if (filter.EndDate.HasValue)
            query = query.Where(a => a.RequestedDate <= filter.EndDate.Value);
        if (filter.DepartmentId.HasValue)
            query = query.Where(a => a.Employee.DepartmentId == filter.DepartmentId.Value);
        if (!string.IsNullOrWhiteSpace(filter.Status))
            query = query.Where(a => a.Status == filter.Status);

        var items = await query.OrderByDescending(a => a.CreatedAt).ToListAsync();

        return new AppointmentReportDto
        {
            TotalAppointments = items.Count,
            PendingCount = items.Count(a => a.Status == "Pending"),
            ApprovedCount = items.Count(a => a.Status == "Approved"),
            RejectedCount = items.Count(a => a.Status == "Rejected"),
            CompletedCount = items.Count(a => a.Status == "Completed"),
            CancelledCount = items.Count(a => a.Status == "Cancelled"),
            Items = items.Select(a => new AppointmentReportItemDto
            {
                AppointmentId = a.Id,
                AppointmentCode = a.AppointmentCode,
                VisitorName = a.Visitor?.FullName ?? "",
                EmployeeName = a.Employee?.FullName ?? "",
                DepartmentName = a.Employee?.Department?.Name ?? "",
                Purpose = a.Purpose,
                RequestedDate = a.RequestedDate,
                Status = a.Status,
                CreatedAt = a.CreatedAt.DateTime
            }).ToList()
        };
    }

    public async Task<List<DepartmentReportDto>> GetDepartmentReportAsync(ReportFilterDto filter)
    {
        var departments = await _context.Departments.Include(d => d.Employees).ToListAsync();
        return departments.Select(d => new DepartmentReportDto
        {
            DepartmentId = d.Id,
            DepartmentName = d.Name,
            EmployeeCount = d.Employees?.Count ?? 0,
            TotalAppointments = _context.Appointments.Count(a => a.Employee.DepartmentId == d.Id),
            PendingApprovals = _context.Appointments.Count(a => a.Employee.DepartmentId == d.Id && a.Status == "Pending"),
            CompletedVisits = _context.Visits.Count(v => _context.Appointments.Any(a => a.Id == v.AppointmentId && a.Employee.DepartmentId == d.Id))
        }).ToList();
    }

    public async Task<List<EmployeeReportDto>> GetEmployeeReportAsync(ReportFilterDto filter)
    {
        var query = _context.Employees.Include(e => e.Department).AsQueryable();
        if (filter.DepartmentId.HasValue)
            query = query.Where(e => e.DepartmentId == filter.DepartmentId.Value);

        var employees = await query.ToListAsync();
        return employees.Select(e => new EmployeeReportDto
        {
            EmployeeId = e.Id,
            EmployeeName = e.FullName,
            DepartmentName = e.Department?.Name ?? "",
            TotalAppointments = _context.Appointments.Count(a => a.EmployeeId == e.Id),
            PendingAppointments = _context.Appointments.Count(a => a.EmployeeId == e.Id && a.Status == "Pending"),
            CompletedAppointments = _context.Appointments.Count(a => a.EmployeeId == e.Id && a.Status == "Completed"),
            TotalVisitsHosted = _context.Visits.Count(v => _context.Appointments.Any(a => a.Id == v.AppointmentId && a.EmployeeId == e.Id))
        }).ToList();
    }

    public async Task<byte[]> ExportVisitorsAsync(ReportFilterDto filter)
    {
        var report = await GetVisitorReportAsync(filter);
        var csv = new System.Text.StringBuilder();
        csv.AppendLine("Full Name,Organization,Visit Count,Last Visit Date");
        foreach (var item in report.Items)
            csv.AppendLine($"{item.FullName},{item.Organization ?? ""},{item.VisitCount},{item.LastVisitDate:yyyy-MM-dd}");
        return System.Text.Encoding.UTF8.GetBytes(csv.ToString());
    }

    public async Task<byte[]> ExportAppointmentsAsync(ReportFilterDto filter)
    {
        var report = await GetAppointmentReportAsync(filter);
        var csv = new System.Text.StringBuilder();
        csv.AppendLine("Code,Visitor,Employee,Department,Purpose,Date,Status");
        foreach (var item in report.Items)
            csv.AppendLine($"{item.AppointmentCode},{item.VisitorName},{item.EmployeeName},{item.DepartmentName},{item.Purpose},{item.RequestedDate:yyyy-MM-dd},{item.Status}");
        return System.Text.Encoding.UTF8.GetBytes(csv.ToString());
    }

    public async Task<byte[]> ExportVisitsAsync(ReportFilterDto filter)
    {
        var query = _context.Visits
            .Include(v => v.Visitor).Include(v => v.Employee).ThenInclude(e => e.Department)
            .AsQueryable();

        if (filter.StartDate.HasValue)
            query = query.Where(v => v.CheckInTime >= filter.StartDate.Value.ToDateTime(TimeOnly.MinValue));
        if (filter.EndDate.HasValue)
            query = query.Where(v => v.CheckInTime <= filter.EndDate.Value.ToDateTime(TimeOnly.MaxValue));

        var visits = await query.OrderByDescending(v => v.CheckInTime).ToListAsync();
        var csv = new System.Text.StringBuilder();
        csv.AppendLine("Visitor,Employee,Department,Check In,Check Out,Badge Number");
        foreach (var v in visits)
            csv.AppendLine($"{v.Visitor?.FullName ?? ""},{v.Employee?.FullName ?? ""},{v.Employee?.Department?.Name ?? ""},{v.CheckInTime:yyyy-MM-dd HH:mm},{v.CheckOutTime?.ToString("yyyy-MM-dd HH:mm") ?? ""},{v.BadgeNumber ?? ""}");
        return System.Text.Encoding.UTF8.GetBytes(csv.ToString());
    }
}
