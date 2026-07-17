using EcxVisitorManagement.Models;

namespace EcxVisitorManagement.Interfaces;

public interface IAuditLogRepository : IGenericRepository<AuditLog>
{
    Task<IReadOnlyList<AuditLog>> GetByUserIdAsync(int userId);
    Task<IReadOnlyList<AuditLog>> GetByEntityAsync(string entityName, int entityId);
    Task<IReadOnlyList<AuditLog>> GetByDateRangeAsync(DateOnly start, DateOnly end);
}
