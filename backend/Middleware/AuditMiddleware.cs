using System.Diagnostics;
using System.Security.Claims;
using System.Text.Json;
using EcxVisitorManagement.Interfaces;

namespace EcxVisitorManagement.Middleware;

public class AuditMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<AuditMiddleware> _logger;

    public AuditMiddleware(RequestDelegate next, ILogger<AuditMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, IAuditLogRepository auditLogRepository)
    {
        var stopwatch = Stopwatch.StartNew();

        if (ShouldSkipAudit(context))
        {
            await _next(context);
            return;
        }

        var originalBodyStream = context.Response.Body;
        using var responseBody = new MemoryStream();
        context.Response.Body = responseBody;

        try
        {
            await _next(context);

            stopwatch.Stop();

            if (IsWriteMethod(context.Request.Method) && context.Response.StatusCode < 400)
            {
                await LogAuditAsync(context, auditLogRepository);
            }

            responseBody.Seek(0, SeekOrigin.Begin);
            await responseBody.CopyToAsync(originalBodyStream);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Audit middleware error for {Path}", context.Request.Path);
            responseBody.Seek(0, SeekOrigin.Begin);
            await responseBody.CopyToAsync(originalBodyStream);
        }
        finally
        {
            context.Response.Body = originalBodyStream;
        }
    }

    private static bool ShouldSkipAudit(HttpContext context)
    {
        var path = context.Request.Path.Value?.ToLowerInvariant() ?? string.Empty;
        return path.Contains("/auth/login") ||
               path.Contains("/auth/register") ||
               path.Contains("/auth/forgot-password") ||
               path.Contains("/auth/reset-password") ||
               path.Contains("/auth/refresh-token") ||
               path.Contains("/uploads/") ||
               path.Contains("swagger") ||
               path.Contains("health");
    }

    private static bool IsWriteMethod(string method) =>
        method.Equals("POST", StringComparison.OrdinalIgnoreCase) ||
        method.Equals("PUT", StringComparison.OrdinalIgnoreCase) ||
        method.Equals("PATCH", StringComparison.OrdinalIgnoreCase) ||
        method.Equals("DELETE", StringComparison.OrdinalIgnoreCase);

    private static async Task LogAuditAsync(HttpContext context, IAuditLogRepository auditLogRepository)
    {
        var userIdClaim = context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            return;

        var path = context.Request.Path.Value ?? string.Empty;
        var method = context.Request.Method;
        var action = $"{method} {path}";

        var entityName = ExtractEntityName(path);
        var entityId = ExtractEntityId(path);

        var ipAddress = context.Connection.RemoteIpAddress?.ToString();
        var userAgent = context.Request.Headers.UserAgent.FirstOrDefault();

        var auditLog = new Models.AuditLog
        {
            UserId = userId,
            Action = action,
            EntityName = entityName,
            EntityId = entityId,
            IpAddress = ipAddress,
            UserAgent = userAgent,
            CreatedAt = DateTimeOffset.UtcNow
        };

        try
        {
            await auditLogRepository.AddAsync(auditLog);
        }
        catch (Exception ex)
        {
            var logger = context.RequestServices.GetRequiredService<ILogger<AuditMiddleware>>();
            logger.LogWarning(ex, "Failed to save audit log for {Path}", path);
        }
    }

    private static string ExtractEntityName(string path)
    {
        var segments = path.Split('/', StringSplitOptions.RemoveEmptyEntries);
        if (segments.Length > 1 && segments[0] == "api")
            return segments[1];
        return string.Empty;
    }

    private static int ExtractEntityId(string path)
    {
        var segments = path.Split('/', StringSplitOptions.RemoveEmptyEntries);
        for (var i = 1; i < segments.Length; i++)
        {
            if (int.TryParse(segments[i], out var id))
                return id;
        }
        return 0;
    }
}
