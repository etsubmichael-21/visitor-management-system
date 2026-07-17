using EcxVisitorManagement.DTOs.Common;
using EcxVisitorManagement.Models;

namespace EcxVisitorManagement.Interfaces;

public interface IAuditLogService
{
    Task<PagedResponse<AuditLog>> GetAllAsync(PageRequest request);
    Task LogAsync(int userId, string action, string entityName, int entityId, object? oldValues, object? newValues, string? ipAddress, string? userAgent);
}
