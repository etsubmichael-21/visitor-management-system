using Microsoft.EntityFrameworkCore;
using EcxVisitorManagement.Data;
using EcxVisitorManagement.Interfaces;
using EcxVisitorManagement.DTOs.Common;
using EcxVisitorManagement.Models;

namespace EcxVisitorManagement.Repositories.Implementation;

public class AppointmentRepository : GenericRepository<Appointment>, IAppointmentRepository
{
    public AppointmentRepository(AppDbContext context) : base(context) { }

    public override async Task<PagedResponse<Appointment>> GetPagedAsync(DTOs.Common.PageRequest request)
    {
        var query = _dbSet
            .Include(a => a.Visitor)
            .Include(a => a.Employee).ThenInclude(e => e.Department)
            .Include(a => a.DelegatedToEmployee)
            .Include(a => a.Attachments)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
            query = query.Where(a => a.Purpose.Contains(request.Search) || a.Visitor.FullName.Contains(request.Search) || a.Employee.FullName.Contains(request.Search));

        var totalCount = await query.CountAsync();
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

    public override async Task<Appointment?> GetByIdAsync(int id) =>
        await _dbSet.Include(a => a.Visitor).Include(a => a.Employee).ThenInclude(e => e.Department)
            .Include(a => a.DelegatedToEmployee).Include(a => a.OriginalEmployee)
            .Include(a => a.Attachments).Include(a => a.Comments).ThenInclude(c => c.User)
            .Include(a => a.RescheduleRequests).ThenInclude(r => r.RequestedByUser)
            .FirstOrDefaultAsync(a => a.Id == id);

    public async Task<IReadOnlyList<Appointment>> GetByVisitorIdAsync(int visitorId) =>
        await _dbSet.Where(a => a.VisitorId == visitorId).Include(a => a.Employee).ThenInclude(e => e.Department)
            .Include(a => a.DelegatedToEmployee).OrderByDescending(a => a.CreatedAt).ToListAsync();

    public async Task<IReadOnlyList<Appointment>> GetByEmployeeIdAsync(int employeeId) =>
        await _dbSet.Where(a => a.EmployeeId == employeeId).Include(a => a.Visitor)
            .Include(a => a.Employee).ThenInclude(e => e.Department)
            .Include(a => a.DelegatedToEmployee).Include(a => a.Attachments)
            .OrderByDescending(a => a.CreatedAt).ToListAsync();

    public async Task<IReadOnlyList<Appointment>> GetPendingAsync() =>
        await _dbSet.Where(a => a.Status == "Pending").Include(a => a.Visitor)
            .Include(a => a.Employee).ThenInclude(e => e.Department).OrderByDescending(a => a.CreatedAt).ToListAsync();

    public async Task<IReadOnlyList<Appointment>> GetTodayAsync() =>
        await _dbSet.Where(a => a.RequestedDate == DateOnly.FromDateTime(DateTime.UtcNow))
            .Include(a => a.Visitor).Include(a => a.Employee).ThenInclude(e => e.Department)
            .OrderBy(a => a.RequestedStartTime).ToListAsync();

    public async Task<IReadOnlyList<Appointment>> GetByStatusAsync(string status) =>
        await _dbSet.Where(a => a.Status == status).Include(a => a.Visitor)
            .Include(a => a.Employee).ThenInclude(e => e.Department).ToListAsync();

    public async Task<IReadOnlyList<Appointment>> GetByDepartmentIdAsync(int departmentId) =>
        await _dbSet.Where(a => a.Employee.DepartmentId == departmentId).Include(a => a.Visitor)
            .Include(a => a.Employee).ThenInclude(e => e.Department)
            .Include(a => a.DelegatedToEmployee).OrderByDescending(a => a.CreatedAt).ToListAsync();

    public async Task<Appointment?> GetByCodeAsync(string code) =>
        await _dbSet.Include(a => a.Visitor).Include(a => a.Employee).ThenInclude(e => e.Department)
            .FirstOrDefaultAsync(a => a.AppointmentCode == code);

    public async Task<IReadOnlyList<Appointment>> GetConfidentialAsync() =>
        await _dbSet.Where(a => a.IsConfidential).Include(a => a.Visitor)
            .Include(a => a.Employee).ThenInclude(e => e.Department)
            .Include(a => a.DelegatedToEmployee).OrderByDescending(a => a.CreatedAt).ToListAsync();

    public async Task<IReadOnlyList<Appointment>> GetPendingByDepartmentAsync(int departmentId) =>
        await _dbSet.Where(a => a.Status == "Pending" && a.Employee.DepartmentId == departmentId)
            .Include(a => a.Visitor).Include(a => a.Employee).ThenInclude(e => e.Department)
            .OrderByDescending(a => a.CreatedAt).ToListAsync();

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
