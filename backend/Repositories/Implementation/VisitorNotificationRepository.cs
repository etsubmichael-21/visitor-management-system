using Microsoft.EntityFrameworkCore;
using EcxVisitorManagement.Data;
using EcxVisitorManagement.Interfaces;
using EcxVisitorManagement.Models;

namespace EcxVisitorManagement.Repositories.Implementation;

public class VisitorNotificationRepository : GenericRepository<VisitorNotification>, IVisitorNotificationRepository
{
    public VisitorNotificationRepository(AppDbContext context) : base(context) { }

    public async Task<IReadOnlyList<VisitorNotification>> GetByVisitorIdAsync(int visitorId) =>
        await _dbSet.Where(vn => vn.VisitorId == visitorId).OrderByDescending(vn => vn.CreatedAt).ToListAsync();

    public async Task<IReadOnlyList<VisitorNotification>> GetUnreadByVisitorIdAsync(int visitorId) =>
        await _dbSet.Where(vn => vn.VisitorId == visitorId && !vn.IsRead).OrderByDescending(vn => vn.CreatedAt).ToListAsync();

    public async Task<int> CountUnreadAsync(int visitorId) =>
        await _dbSet.CountAsync(vn => vn.VisitorId == visitorId && !vn.IsRead);

    public async Task MarkAsReadAsync(int id)
    {
        var n = await _dbSet.FindAsync(id);
        if (n != null) { n.IsRead = true; n.ReadAt = DateTimeOffset.UtcNow; await _context.SaveChangesAsync(); }
    }

    public async Task MarkAllAsReadAsync(int visitorId)
    {
        var unread = await _dbSet.Where(vn => vn.VisitorId == visitorId && !vn.IsRead).ToListAsync();
        foreach (var n in unread) { n.IsRead = true; n.ReadAt = DateTimeOffset.UtcNow; }
        await _context.SaveChangesAsync();
    }
}
