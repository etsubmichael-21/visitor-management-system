using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using EcxVisitorManagement.Data;
using EcxVisitorManagement.DTOs.Common;
using EcxVisitorManagement.Interfaces;
using EcxVisitorManagement.Models;

namespace EcxVisitorManagement.Services.Implementation;

public class AuditLogService : IAuditLogService
{
    private readonly AppDbContext _context;
    public AuditLogService(AppDbContext context) => _context = context;

    public async Task<PagedResponse<AuditLog>> GetAllAsync(PageRequest request)
    {
        var query = _context.AuditLogs.AsQueryable();
        var totalCount = await query.CountAsync();
        var items = await query.OrderByDescending(a => a.CreatedAt).Skip((request.Page - 1) * request.PageSize).Take(request.PageSize).ToListAsync();
        return new PagedResponse<AuditLog> { Items = items.ToList(), TotalCount = totalCount, Page = request.Page, PageSize = request.PageSize };
    }

    public async Task LogAsync(int userId, string action, string entityName, int entityId, object? oldValues, object? newValues, string? ipAddress, string? userAgent)
    {
        var log = new AuditLog
        {
            UserId = userId, Action = action, EntityName = entityName, EntityId = entityId,
            OldValues = oldValues != null ? JsonSerializer.Serialize(oldValues) : null,
            NewValues = newValues != null ? JsonSerializer.Serialize(newValues) : null,
            IpAddress = ipAddress, UserAgent = userAgent, CreatedAt = DateTimeOffset.UtcNow
        };
        _context.AuditLogs.Add(log);
        await _context.SaveChangesAsync();
    }
}
