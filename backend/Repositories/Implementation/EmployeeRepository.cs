using Microsoft.EntityFrameworkCore;
using EcxVisitorManagement.Data;
using EcxVisitorManagement.Interfaces;
using EcxVisitorManagement.DTOs.Common;
using EcxVisitorManagement.Models;

namespace EcxVisitorManagement.Repositories.Implementation;

public class EmployeeRepository : GenericRepository<Employee>, IEmployeeRepository
{
    public EmployeeRepository(AppDbContext context) : base(context) { }

    public override async Task<PagedResponse<Employee>> GetPagedAsync(DTOs.Common.PageRequest request)
    {
        var query = _dbSet.Include(e => e.Department).AsQueryable();
        if (!string.IsNullOrWhiteSpace(request.Search))
            query = query.Where(e => e.FullName.Contains(request.Search) || e.Email.Contains(request.Search) || e.Position.Contains(request.Search));
        var totalCount = await query.CountAsync();
        query = request.SortBy?.ToLower() switch
        {
            "name" => request.SortDesc ? query.OrderByDescending(e => e.FullName) : query.OrderBy(e => e.FullName),
            "department" => request.SortDesc ? query.OrderByDescending(e => e.Department.Name) : query.OrderBy(e => e.Department.Name),
            _ => query.OrderBy(e => e.FullName)
        };
        var items = await query.Skip((request.Page - 1) * request.PageSize).Take(request.PageSize).ToListAsync();
        return new DTOs.Common.PagedResponse<Employee> { Items = items, TotalCount = totalCount, Page = request.Page, PageSize = request.PageSize };
    }

    public override async Task<Employee?> GetByIdAsync(int id) =>
        await _dbSet.Include(e => e.Department).Include(e => e.Schedules).Include(e => e.Unavailabilities).FirstOrDefaultAsync(e => e.Id == id);

    public async Task<Employee?> GetByEmailAsync(string email) => await _dbSet.FirstOrDefaultAsync(e => e.Email == email);
    public async Task<IReadOnlyList<Employee>> GetByDepartmentIdAsync(int departmentId) =>
        await _dbSet.Where(e => e.DepartmentId == departmentId).Include(e => e.Department).ToListAsync();

    public async Task<IReadOnlyList<Employee>> GetAvailableEmployeesAsync() =>
        await _dbSet.Where(e => e.Status == "Active").Include(e => e.Department).OrderBy(e => e.FullName).ToListAsync();

    public async Task<Employee?> GetWithSchedulesAsync(int id) =>
        await _dbSet.Include(e => e.Schedules).FirstOrDefaultAsync(e => e.Id == id);

    public async Task<IReadOnlyList<Employee>> SearchAsync(string query) =>
        await _dbSet.Where(e => e.FullName.Contains(query) || e.Email.Contains(query)).Include(e => e.Department).ToListAsync();

    public async Task<bool> IsAvailableOnDateAsync(int employeeId, DateOnly date)
    {
        var dayOfWeek = date.DayOfWeek.ToString();
        var hasSchedule = await _context.EmployeeSchedules.AnyAsync(s => s.EmployeeId == employeeId && s.DayOfWeek == dayOfWeek && s.IsAvailable);
        if (!hasSchedule) return false;
        var isUnavailable = await _context.EmployeeUnavailabilities.AnyAsync(u => u.EmployeeId == employeeId && u.StartDate <= date && (u.EndDate == null || u.EndDate >= date));
        return !isUnavailable;
    }

    public async Task<IReadOnlyList<Employee>> GetByUserIdAsync(int userId) =>
        await _dbSet.Where(e => e.UserId == userId).ToListAsync();
}
