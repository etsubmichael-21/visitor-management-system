using Microsoft.EntityFrameworkCore;
using EcxVisitorManagement.Data;
using EcxVisitorManagement.Interfaces;
using EcxVisitorManagement.DTOs.Common;
using EcxVisitorManagement.Models;

namespace EcxVisitorManagement.Repositories.Implementation;

public class NotificationRepository : GenericRepository<Notification>, INotificationRepository
{
    public NotificationRepository(AppDbContext context) : base(context) { }

    public override async Task<PagedResponse<Notification>> GetPagedAsync(DTOs.Common.PageRequest request)
    {
        var query = _dbSet.Include(n => n.Employee).Include(n => n.Appointment).AsQueryable();
        var totalCount = await query.CountAsync();
        query = query.OrderByDescending(n => n.CreatedAt);
        var items = await query.Skip((request.Page - 1) * request.PageSize).Take(request.PageSize).ToListAsync();
        return new DTOs.Common.PagedResponse<Notification> { Items = items, TotalCount = totalCount, Page = request.Page, PageSize = request.PageSize };
    }

    public async Task<IReadOnlyList<Notification>> GetByEmployeeIdAsync(int employeeId) =>
        await _dbSet.Where(n => n.EmployeeId == employeeId).OrderByDescending(n => n.CreatedAt).ToListAsync();

    public async Task<IReadOnlyList<Notification>> GetByEmployeeIdsAsync(IEnumerable<int> employeeIds)
    {
        var ids = employeeIds.ToList();
        if (ids.Count == 0) return new List<Notification>();
        return await _dbSet.Where(n => ids.Contains(n.EmployeeId)).OrderByDescending(n => n.CreatedAt).ToListAsync();
    }

    public async Task<IReadOnlyList<Notification>> GetUnreadByEmployeeIdAsync(int employeeId) =>
        await _dbSet.Where(n => n.EmployeeId == employeeId && !n.IsRead).OrderByDescending(n => n.CreatedAt).ToListAsync();

    public async Task<IReadOnlyList<Notification>> GetUnreadByEmployeeIdsAsync(IEnumerable<int> employeeIds)
    {
        var ids = employeeIds.ToList();
        if (ids.Count == 0) return new List<Notification>();
        return await _dbSet.Where(n => ids.Contains(n.EmployeeId) && !n.IsRead).OrderByDescending(n => n.CreatedAt).ToListAsync();
    }

    public async Task<int> CountUnreadAsync(int employeeId) =>
        await _dbSet.CountAsync(n => n.EmployeeId == employeeId && !n.IsRead);

    public async Task<int> CountUnreadByEmployeeIdsAsync(IEnumerable<int> employeeIds)
    {
        var ids = employeeIds.ToList();
        if (ids.Count == 0) return 0;
        return await _dbSet.CountAsync(n => ids.Contains(n.EmployeeId) && !n.IsRead);
    }

    public async Task MarkAsReadAsync(int id)
    {
        var notification = await _dbSet.FindAsync(id);
        if (notification != null) { notification.IsRead = true; notification.ReadAt = DateTimeOffset.UtcNow; await _context.SaveChangesAsync(); }
    }

    public async Task MarkAllAsReadAsync(int employeeId)
    {
        var unread = await _dbSet.Where(n => n.EmployeeId == employeeId && !n.IsRead).ToListAsync();
        foreach (var n in unread) { n.IsRead = true; n.ReadAt = DateTimeOffset.UtcNow; }
        await _context.SaveChangesAsync();
    }

    public async Task MarkAllAsReadByEmployeeIdsAsync(IEnumerable<int> employeeIds)
    {
        var ids = employeeIds.ToList();
        if (ids.Count == 0) return;
        var unread = await _dbSet.Where(n => ids.Contains(n.EmployeeId) && !n.IsRead).ToListAsync();
        foreach (var n in unread) { n.IsRead = true; n.ReadAt = DateTimeOffset.UtcNow; }
        await _context.SaveChangesAsync();
    }
}
