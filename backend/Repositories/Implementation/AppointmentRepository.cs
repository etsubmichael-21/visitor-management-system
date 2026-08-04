using Microsoft.EntityFrameworkCore;
using EcxVisitorManagement.Data;
using EcxVisitorManagement.Interfaces;
using EcxVisitorManagement.DTOs.Common;
using EcxVisitorManagement.Models;

namespace EcxVisitorManagement.Repositories.Implementation;

public class AppointmentRepository : GenericRepository<Appointment>, IAppointmentRepository
{
    private readonly ILogger<AppointmentRepository> _logger;

    public AppointmentRepository(AppDbContext context, ILogger<AppointmentRepository> logger) : base(context)
    {
        _logger = logger;
    }

    public override async Task<PagedResponse<Appointment>> GetPagedAsync(DTOs.Common.PageRequest request)
    {
        var query = _dbSet
            .Include(a => a.Visitor)
            .Include(a => a.Employee).ThenInclude(e => e.Department)
            .Include(a => a.DelegatedToEmployee)
            .Include(a => a.Attachments)
            .AsQueryable();

        query = ApplyFilters(query, request);

        var sql = query.ToQueryString();
        _logger.LogInformation("[Appointments] Filters Status={Status} From={DateFrom} To={DateTo} Search={Search} Page={Page} PageSize={PageSize} SQL={Sql}",
            request.Status, request.DateFrom, request.DateTo, request.Search, request.Page, request.PageSize, sql);
        var totalCount = await query.CountAsync();
        _logger.LogInformation("[Appointments] TotalCount={TotalCount}", totalCount);
        query = request.SortBy?.ToLower() switch
        {
            "date" => request.SortDesc ? query.OrderByDescending(a => a.RequestedDate) : query.OrderBy(a => a.RequestedDate),
            "status" => request.SortDesc ? query.OrderByDescending(a => a.Status) : query.OrderBy(a => a.Status),
            "created" => request.SortDesc ? query.OrderByDescending(a => a.CreatedAt) : query.OrderBy(a => a.CreatedAt),
            _ => query.OrderByDescending(a => a.CreatedAt)
        };

        var items = await query.Skip((request.Page - 1) * request.PageSize).Take(request.PageSize).ToListAsync();
        return new DTOs.Common.PagedResponse<Appointment> { Items = items, TotalCount = totalCount, Page = request.Page, PageSize = request.PageSize };
    }

    public async Task<DTOs.Common.PagedResponse<Appointment>> GetPagedByEmployeeIdAsync(int employeeId, DTOs.Common.PageRequest request)
    {
        var query = _dbSet
            .Include(a => a.Visitor)
            .Include(a => a.Employee).ThenInclude(e => e.Department)
            .Include(a => a.DelegatedToEmployee)
            .Include(a => a.Attachments)
            .Where(a => a.AssignedEmployeeId == employeeId || a.EmployeeId == employeeId)
            .AsQueryable();

        query = ApplyFilters(query, request);

        var sql = query.ToQueryString();
        _logger.LogInformation("[Appointments:Employee] EmployeeId={EmployeeId} Filters Status={Status} From={DateFrom} To={DateTo} Search={Search} Page={Page} PageSize={PageSize} SQL={Sql}",
            employeeId, request.Status, request.DateFrom, request.DateTo, request.Search, request.Page, request.PageSize, sql);
        var totalCount = await query.CountAsync();
        _logger.LogInformation("[Appointments:Employee] EmployeeId={EmployeeId} TotalCount={TotalCount}", employeeId, totalCount);
        query = request.SortBy?.ToLower() switch
        {
            "date" => request.SortDesc ? query.OrderByDescending(a => a.RequestedDate) : query.OrderBy(a => a.RequestedDate),
            "status" => request.SortDesc ? query.OrderByDescending(a => a.Status) : query.OrderBy(a => a.Status),
            "created" => request.SortDesc ? query.OrderByDescending(a => a.CreatedAt) : query.OrderBy(a => a.CreatedAt),
            _ => query.OrderByDescending(a => a.CreatedAt)
        };

        var items = await query.Skip((request.Page - 1) * request.PageSize).Take(request.PageSize).ToListAsync();
        return new DTOs.Common.PagedResponse<Appointment> { Items = items, TotalCount = totalCount, Page = request.Page, PageSize = request.PageSize };
    }

    public async Task<PagedResponse<Appointment>> GetPagedByDepartmentIdAsync(int departmentId, PageRequest request)
    {
        var query = _dbSet
            .Include(a => a.Visitor)
            .Include(a => a.Employee).ThenInclude(e => e.Department)
            .Include(a => a.AssignedEmployee).ThenInclude(e => e.Department)
            .Include(a => a.DelegatedToEmployee)
            .Include(a => a.Attachments)
            .Where(a => a.AssignedDepartmentId == departmentId
                || (a.AssignedDepartmentId == null && a.Employee.DepartmentId == departmentId))
            .AsQueryable();

        query = ApplyFilters(query, request);

        var sql = query.ToQueryString();
        _logger.LogInformation("[Appointments:Department] DepartmentId={DepartmentId} Filters Status={Status} From={DateFrom} To={DateTo} Search={Search} Page={Page} PageSize={PageSize} SQL={Sql}",
            departmentId, request.Status, request.DateFrom, request.DateTo, request.Search, request.Page, request.PageSize, sql);
        var totalCount = await query.CountAsync();
        _logger.LogInformation("[Appointments:Department] DepartmentId={DepartmentId} TotalCount={TotalCount}", departmentId, totalCount);
        query = request.SortBy?.ToLower() switch
        {
            "date" => request.SortDesc ? query.OrderByDescending(a => a.RequestedDate) : query.OrderBy(a => a.RequestedDate),
            "status" => request.SortDesc ? query.OrderByDescending(a => a.Status) : query.OrderBy(a => a.Status),
            "created" => request.SortDesc ? query.OrderByDescending(a => a.CreatedAt) : query.OrderBy(a => a.CreatedAt),
            _ => query.OrderByDescending(a => a.CreatedAt)
        };

        var items = await query.Skip((request.Page - 1) * request.PageSize).Take(request.PageSize).ToListAsync();
        return new PagedResponse<Appointment> { Items = items, TotalCount = totalCount, Page = request.Page, PageSize = request.PageSize };
    }

    public override async Task<Appointment?> GetByIdAsync(int id) =>
        await _dbSet.Include(a => a.Visitor).Include(a => a.Employee).ThenInclude(e => e.Department)
            .Include(a => a.AssignedEmployee).ThenInclude(e => e.Department)
            .Include(a => a.DelegatedToEmployee).Include(a => a.OriginalEmployee)
            .Include(a => a.Attachments).Include(a => a.Comments).ThenInclude(c => c.User)
            .Include(a => a.RescheduleRequests).ThenInclude(r => r.RequestedByUser)
            .FirstOrDefaultAsync(a => a.Id == id);

    public async Task<PagedResponse<Appointment>> GetPagedByVisitorIdAsync(int visitorId, PageRequest request)
    {
        var query = _dbSet
            .Include(a => a.Employee).ThenInclude(e => e.Department)
            .Include(a => a.DelegatedToEmployee)
            .Where(a => a.VisitorId == visitorId)
            .AsQueryable();

        query = ApplyFilters(query, request);

        var sql = query.ToQueryString();
        _logger.LogInformation("[Appointments:Visitor] VisitorId={VisitorId} Filters Status={Status} From={DateFrom} To={DateTo} Search={Search} Page={Page} PageSize={PageSize} SQL={Sql}",
            visitorId, request.Status, request.DateFrom, request.DateTo, request.Search, request.Page, request.PageSize, sql);
        var totalCount = await query.CountAsync();
        _logger.LogInformation("[Appointments:Visitor] VisitorId={VisitorId} TotalCount={TotalCount}", visitorId, totalCount);
        query = request.SortBy?.ToLower() switch
        {
            "date" => request.SortDesc ? query.OrderByDescending(a => a.RequestedDate) : query.OrderBy(a => a.RequestedDate),
            "status" => request.SortDesc ? query.OrderByDescending(a => a.Status) : query.OrderBy(a => a.Status),
            "created" => request.SortDesc ? query.OrderByDescending(a => a.CreatedAt) : query.OrderBy(a => a.CreatedAt),
            _ => query.OrderByDescending(a => a.CreatedAt)
        };

        var items = await query.Skip((request.Page - 1) * request.PageSize).Take(request.PageSize).ToListAsync();
        return new PagedResponse<Appointment> { Items = items, TotalCount = totalCount, Page = request.Page, PageSize = request.PageSize };
    }

    private static IQueryable<Appointment> ApplyFilters(IQueryable<Appointment> query, PageRequest request)
    {
        if (!string.IsNullOrWhiteSpace(request.Search))
            query = query.Where(a => a.Purpose.Contains(request.Search) || a.Visitor.FullName.Contains(request.Search) || a.Employee.FullName.Contains(request.Search));

        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            var statuses = request.Status.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            query = query.Where(a => statuses.Contains(a.Status));
        }

        if (request.DateFrom.HasValue)
            query = query.Where(a => a.RequestedDate >= request.DateFrom.Value);

        if (request.DateTo.HasValue)
            query = query.Where(a => a.RequestedDate <= request.DateTo.Value);

        return query;
    }

    public async Task<IReadOnlyList<Appointment>> GetByVisitorIdAsync(int visitorId) =>
        await _dbSet.Where(a => a.VisitorId == visitorId).Include(a => a.Employee).ThenInclude(e => e.Department)
            .Include(a => a.DelegatedToEmployee).OrderByDescending(a => a.CreatedAt).ToListAsync();

    public async Task<IReadOnlyList<Appointment>> GetByEmployeeIdAsync(int employeeId) =>
        await _dbSet.Where(a => a.AssignedEmployeeId == employeeId || a.EmployeeId == employeeId).Include(a => a.Visitor)
            .Include(a => a.Employee).ThenInclude(e => e.Department)
            .Include(a => a.AssignedEmployee).ThenInclude(e => e.Department)
            .Include(a => a.DelegatedToEmployee).Include(a => a.Attachments)
            .OrderByDescending(a => a.CreatedAt).ToListAsync();

    public async Task<IReadOnlyList<Appointment>> GetPendingAsync() =>
        await _dbSet.Where(a => a.Status == "Pending").Include(a => a.Visitor)
            .Include(a => a.Employee).ThenInclude(e => e.Department).OrderByDescending(a => a.CreatedAt).ToListAsync();

    public async Task<IReadOnlyList<Appointment>> GetPendingByEmployeeIdAsync(int employeeId) =>
        await _dbSet.Where(a => a.Status == "Pending" && (a.AssignedEmployeeId == employeeId || a.EmployeeId == employeeId)).Include(a => a.Visitor)
            .Include(a => a.Employee).ThenInclude(e => e.Department)
            .Include(a => a.AssignedEmployee).ThenInclude(e => e.Department)
            .OrderByDescending(a => a.CreatedAt).ToListAsync();

    public async Task<IReadOnlyList<Appointment>> GetTodayAsync() =>
        await _dbSet.Where(a => a.RequestedDate == DateOnly.FromDateTime(DateTime.Now))
            .Include(a => a.Visitor).Include(a => a.Employee).ThenInclude(e => e.Department)
            .OrderBy(a => a.RequestedStartTime).ToListAsync();

    public async Task<IReadOnlyList<Appointment>> GetTodayByEmployeeIdAsync(int employeeId) =>
        await _dbSet.Where(a => a.RequestedDate == DateOnly.FromDateTime(DateTime.Now)
                && (a.AssignedEmployeeId == employeeId || a.EmployeeId == employeeId))
            .Include(a => a.Visitor).Include(a => a.Employee).ThenInclude(e => e.Department)
            .Include(a => a.AssignedEmployee).ThenInclude(e => e.Department)
            .OrderBy(a => a.RequestedStartTime).ToListAsync();

    public async Task<IReadOnlyList<Appointment>> GetByStatusAsync(string status) =>
        await _dbSet.Where(a => a.Status == status).Include(a => a.Visitor)
            .Include(a => a.Employee).ThenInclude(e => e.Department).ToListAsync();

    public async Task<IReadOnlyList<Appointment>> GetByDepartmentIdAsync(int departmentId) =>
        await _dbSet.Where(a => a.AssignedDepartmentId == departmentId
                || (a.AssignedDepartmentId == null && a.Employee.DepartmentId == departmentId))
            .Include(a => a.Visitor).Include(a => a.Employee).ThenInclude(e => e.Department)
            .Include(a => a.AssignedEmployee).ThenInclude(e => e.Department)
            .Include(a => a.DelegatedToEmployee).OrderByDescending(a => a.CreatedAt).ToListAsync();

    public async Task<Appointment?> GetByCodeAsync(string code) =>
        await _dbSet.Include(a => a.Visitor).Include(a => a.Employee).ThenInclude(e => e.Department)
            .FirstOrDefaultAsync(a => a.AppointmentCode == code);

    public async Task<IReadOnlyList<Appointment>> GetConfidentialAsync() =>
        await _dbSet.Where(a => a.IsConfidential).Include(a => a.Visitor)
            .Include(a => a.Employee).ThenInclude(e => e.Department)
            .Include(a => a.DelegatedToEmployee).OrderByDescending(a => a.CreatedAt).ToListAsync();

    public async Task<IReadOnlyList<Appointment>> GetPendingByDepartmentAsync(int departmentId) =>
        await _dbSet.Where(a => a.Status == "Pending"
                && (a.AssignedDepartmentId == departmentId
                    || (a.AssignedDepartmentId == null && a.Employee.DepartmentId == departmentId)))
            .Include(a => a.Visitor).Include(a => a.Employee).ThenInclude(e => e.Department)
            .Include(a => a.AssignedEmployee).ThenInclude(e => e.Department)
            .OrderByDescending(a => a.CreatedAt).ToListAsync();

    public async Task<IReadOnlyList<Appointment>> GetConfidentialByDepartmentIdAsync(int departmentId) =>
        await _dbSet.Where(a => a.IsConfidential
                && (a.AssignedDepartmentId == departmentId
                    || (a.AssignedDepartmentId == null && a.Employee.DepartmentId == departmentId)))
            .Include(a => a.Visitor).Include(a => a.Employee).ThenInclude(e => e.Department)
            .Include(a => a.AssignedEmployee).ThenInclude(e => e.Department)
            .Include(a => a.DelegatedToEmployee).OrderByDescending(a => a.CreatedAt).ToListAsync();

    public async Task<IReadOnlyList<Appointment>> GetTodayByDepartmentIdAsync(int departmentId) =>
        await _dbSet.Where(a => a.RequestedDate == DateOnly.FromDateTime(DateTime.Now)
                && (a.AssignedDepartmentId == departmentId
                    || (a.AssignedDepartmentId == null && a.Employee.DepartmentId == departmentId)))
            .Include(a => a.Visitor).Include(a => a.Employee).ThenInclude(e => e.Department)
            .Include(a => a.AssignedEmployee).ThenInclude(e => e.Department)
            .OrderBy(a => a.RequestedStartTime).ToListAsync();

    public async Task<int> CountByStatusAsync(string status) => await _dbSet.CountAsync(a => a.Status == status);

    public async Task<int> CountByDateRangeAsync(DateOnly start, DateOnly end) =>
        await _dbSet.CountAsync(a => a.RequestedDate >= start && a.RequestedDate <= end);

    public async Task<IReadOnlyList<Appointment>> GetByDateRangeAsync(DateOnly start, DateOnly end) =>
        await _dbSet.Where(a => a.RequestedDate >= start && a.RequestedDate <= end)
            .Include(a => a.Visitor).Include(a => a.Employee).ThenInclude(e => e.Department)
            .OrderBy(a => a.RequestedDate).ThenBy(a => a.RequestedStartTime).ToListAsync();

    public async Task<IReadOnlyList<Appointment>> GetOverduePendingAsync(DateOnly beforeDate) =>
        await _dbSet.Where(a => a.Status == "Pending" && a.RequestedDate < beforeDate)
            .Include(a => a.Visitor).Include(a => a.Employee).ToListAsync();
}
