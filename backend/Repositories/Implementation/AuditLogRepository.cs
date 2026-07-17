using Microsoft.EntityFrameworkCore;
using EcxVisitorManagement.Data;
using EcxVisitorManagement.Interfaces;
using EcxVisitorManagement.Models;

namespace EcxVisitorManagement.Repositories.Implementation;

public class AuditLogRepository : GenericRepository<AuditLog>, IAuditLogRepository
{
    public AuditLogRepository(AppDbContext context) : base(context) { }

    public async Task<IReadOnlyList<AuditLog>> GetByUserIdAsync(int userId) =>
        await _dbSet.Where(a => a.UserId == userId).OrderByDescending(a => a.CreatedAt).ToListAsync();

    public async Task<IReadOnlyList<AuditLog>> GetByEntityAsync(string entityName, int entityId) =>
        await _dbSet.Where(a => a.EntityName == entityName && a.EntityId == entityId).OrderByDescending(a => a.CreatedAt).ToListAsync();

    public async Task<IReadOnlyList<AuditLog>> GetByDateRangeAsync(DateOnly start, DateOnly end) =>
        await _dbSet.Where(a => a.CreatedAt.Date >= start.ToDateTime(TimeOnly.MinValue) && a.CreatedAt.Date <= end.ToDateTime(TimeOnly.MaxValue))
            .OrderByDescending(a => a.CreatedAt).ToListAsync();
}
