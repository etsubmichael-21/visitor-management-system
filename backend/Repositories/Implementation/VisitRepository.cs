using Microsoft.EntityFrameworkCore;
using EcxVisitorManagement.Data;
using EcxVisitorManagement.Interfaces;
using EcxVisitorManagement.DTOs.Common;
using EcxVisitorManagement.Models;

namespace EcxVisitorManagement.Repositories.Implementation;

public class VisitRepository : GenericRepository<Visit>, IVisitRepository
{
    private readonly ILogger<VisitRepository> _logger;

    public VisitRepository(AppDbContext context, ILogger<VisitRepository> logger) : base(context)
    {
        _logger = logger;
    }

    public override async Task<PagedResponse<Visit>> GetPagedAsync(DTOs.Common.PageRequest request)
    {
        var query = _dbSet.Include(v => v.Visitor).Include(v => v.Employee).ThenInclude(e => e.Department).AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var term = request.Search.Trim();
            query = query.Where(v => EF.Functions.ILike(v.Visitor.FullName, $"%{term}%")
                || EF.Functions.ILike(v.Visitor.Email, $"%{term}%")
                || EF.Functions.ILike(v.Visitor.Phone, $"%{term}%")
                || EF.Functions.ILike(v.Employee.FullName, $"%{term}%")
                || EF.Functions.ILike(v.Employee.Email, $"%{term}%")
                || EF.Functions.ILike(v.Purpose, $"%{term}%")
                || EF.Functions.ILike(v.BadgeNumber ?? "", $"%{term}%"));
        }

        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            var statuses = request.Status.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Select(s => s == "Expected" ? "Scheduled" : s)
                .ToArray();
            query = query.Where(v => statuses.Contains(v.Status));
        }

        if (request.DateFrom.HasValue)
            query = query.Where(v => v.VisitDate >= request.DateFrom.Value);

        if (request.DateTo.HasValue)
            query = query.Where(v => v.VisitDate <= request.DateTo.Value);

        if (request.IsActive == true)
            query = query.Where(v => v.Status == "CheckedIn");

        var sql = query.ToQueryString();
        _logger.LogInformation("[Visits] Filters Status={Status} From={DateFrom} To={DateTo} IsActive={IsActive} Search={Search} Page={Page} PageSize={PageSize} SQL={Sql}",
            request.Status, request.DateFrom, request.DateTo, request.IsActive, request.Search, request.Page, request.PageSize, sql);
        var totalCount = await query.CountAsync();
        _logger.LogInformation("[Visits] TotalCount={TotalCount}", totalCount);
        query = query.OrderByDescending(v => v.CreatedAt);
        var items = await query.Skip((request.Page - 1) * request.PageSize).Take(request.PageSize).ToListAsync();
        return new DTOs.Common.PagedResponse<Visit> { Items = items, TotalCount = totalCount, Page = request.Page, PageSize = request.PageSize };
    }

    public override async Task<Visit?> GetByIdAsync(int id) =>
        await _dbSet.Include(v => v.Visitor).Include(v => v.Employee).ThenInclude(e => e.Department)
            .Include(v => v.VisitorItems)
            .Include(v => v.CheckoutItems).ThenInclude(ci => ci.AppointmentProperty).ThenInclude(ap => ap.VerifiedByUser)
            .FirstOrDefaultAsync(v => v.Id == id);

    public async Task<IReadOnlyList<Visit>> GetByVisitorIdAsync(int visitorId) =>
        await _dbSet.Where(v => v.VisitorId == visitorId).Include(v => v.Employee).ThenInclude(e => e.Department)
            .OrderByDescending(v => v.CreatedAt).ToListAsync();

    public async Task<IReadOnlyList<Visit>> GetByEmployeeIdAsync(int employeeId) =>
        await _dbSet.Where(v => v.EmployeeId == employeeId).Include(v => v.Visitor).OrderByDescending(v => v.CreatedAt).ToListAsync();

    public async Task<IReadOnlyList<Visit>> GetTodayVisitsAsync() =>
        await _dbSet.Where(v => v.VisitDate == DateOnly.FromDateTime(DateTime.Now))
            .Include(v => v.Visitor).Include(v => v.Employee).ThenInclude(e => e.Department)
            .OrderBy(v => v.CheckInTime).ToListAsync();

    public async Task<IReadOnlyList<Visit>> GetActiveVisitsAsync() =>
        await _dbSet.Where(v => v.Status == "CheckedIn").Include(v => v.Visitor)
            .Include(v => v.Employee).ThenInclude(e => e.Department).Include(v => v.VisitorItems)
            .Include(v => v.CheckoutItems).ThenInclude(ci => ci.AppointmentProperty).ThenInclude(ap => ap.VerifiedByUser)
            .OrderByDescending(v => v.CheckInTime).ToListAsync();

    public async Task<Visit?> GetWithItemsAsync(int id) =>
        await _dbSet.Include(v => v.VisitorItems)
            .Include(v => v.CheckoutItems).ThenInclude(ci => ci.AppointmentProperty).ThenInclude(ap => ap.VerifiedByUser)
            .FirstOrDefaultAsync(v => v.Id == id);

    public async Task<int> CountTodayAsync() =>
        await _dbSet.CountAsync(v => v.VisitDate == DateOnly.FromDateTime(DateTime.Now));

    public async Task<int> CountCheckedInAsync() =>
        await _dbSet.CountAsync(v => v.Status == "CheckedIn");
}
