using Microsoft.EntityFrameworkCore;
using EcxVisitorManagement.Data;
using EcxVisitorManagement.Interfaces;
using EcxVisitorManagement.DTOs.Common;
using EcxVisitorManagement.Models;

namespace EcxVisitorManagement.Repositories.Implementation;

public class VisitRepository : GenericRepository<Visit>, IVisitRepository
{
    public VisitRepository(AppDbContext context) : base(context) { }

    public override async Task<PagedResponse<Visit>> GetPagedAsync(DTOs.Common.PageRequest request)
    {
        var query = _dbSet.Include(v => v.Visitor).Include(v => v.Employee).ThenInclude(e => e.Department).AsQueryable();
        if (!string.IsNullOrWhiteSpace(request.Search))
            query = query.Where(v => v.Visitor.FullName.Contains(request.Search) || v.Employee.FullName.Contains(request.Search));
        var totalCount = await query.CountAsync();
        query = query.OrderByDescending(v => v.CreatedAt);
        var items = await query.Skip((request.Page - 1) * request.PageSize).Take(request.PageSize).ToListAsync();
        return new DTOs.Common.PagedResponse<Visit> { Items = items, TotalCount = totalCount, Page = request.Page, PageSize = request.PageSize };
    }

    public override async Task<Visit?> GetByIdAsync(int id) =>
        await _dbSet.Include(v => v.Visitor).Include(v => v.Employee).ThenInclude(e => e.Department)
            .Include(v => v.VisitorItems).FirstOrDefaultAsync(v => v.Id == id);

    public async Task<IReadOnlyList<Visit>> GetByVisitorIdAsync(int visitorId) =>
        await _dbSet.Where(v => v.VisitorId == visitorId).Include(v => v.Employee).ThenInclude(e => e.Department)
            .OrderByDescending(v => v.CreatedAt).ToListAsync();

    public async Task<IReadOnlyList<Visit>> GetByEmployeeIdAsync(int employeeId) =>
        await _dbSet.Where(v => v.EmployeeId == employeeId).Include(v => v.Visitor).OrderByDescending(v => v.CreatedAt).ToListAsync();

    public async Task<IReadOnlyList<Visit>> GetTodayVisitsAsync() =>
        await _dbSet.Where(v => v.VisitDate == DateOnly.FromDateTime(DateTime.UtcNow))
            .Include(v => v.Visitor).Include(v => v.Employee).ThenInclude(e => e.Department)
            .OrderBy(v => v.CheckInTime).ToListAsync();

    public async Task<IReadOnlyList<Visit>> GetActiveVisitsAsync() =>
        await _dbSet.Where(v => v.Status == "CheckedIn").Include(v => v.Visitor)
            .Include(v => v.Employee).ThenInclude(e => e.Department).Include(v => v.VisitorItems)
            .OrderByDescending(v => v.CheckInTime).ToListAsync();

    public async Task<Visit?> GetWithItemsAsync(int id) =>
        await _dbSet.Include(v => v.VisitorItems).FirstOrDefaultAsync(v => v.Id == id);

    public async Task<int> CountTodayAsync() =>
        await _dbSet.CountAsync(v => v.VisitDate == DateOnly.FromDateTime(DateTime.UtcNow));

    public async Task<int> CountCheckedInAsync() =>
        await _dbSet.CountAsync(v => v.Status == "CheckedIn");
}
