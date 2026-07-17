using System.Net;
using System.Text.Json;
using EcxVisitorManagement.DTOs.Common;

namespace EcxVisitorManagement.Middleware;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Resource not found: {Path}", context.Request.Path);
            context.Response.StatusCode = (int)HttpStatusCode.NotFound;
            context.Response.ContentType = "application/json";
            var response = ApiResponse<object>.NotFound(ex.Message);
            await context.Response.WriteAsync(JsonSerializer.Serialize(response));
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access attempt: {Path} by {User}", context.Request.Path, context.User?.Identity?.Name ?? "anonymous");
            context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
            context.Response.ContentType = "application/json";
            var response = ApiResponse<object>.Unauthorized(ex.Message);
            await context.Response.WriteAsync(JsonSerializer.Serialize(response));
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation at {Path}: {Message}", context.Request.Path, ex.Message);
            context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
            context.Response.ContentType = "application/json";
            var response = ApiResponse<object>.BadRequest(ex.Message);
            await context.Response.WriteAsync(JsonSerializer.Serialize(response));
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid argument at {Path}", context.Request.Path);
            context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
            context.Response.ContentType = "application/json";
            var response = ApiResponse<object>.BadRequest(ex.Message);
            await context.Response.WriteAsync(JsonSerializer.Serialize(response));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception at {Path} by {User}. Method: {Method}, StatusCode: {StatusCode}",
                context.Request.Path, context.User?.Identity?.Name ?? "anonymous",
                context.Request.Method, context.Response.StatusCode);
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            context.Response.ContentType = "application/json";
            var response = ApiResponse<object>.Error("An internal server error occurred");
            await context.Response.WriteAsync(JsonSerializer.Serialize(response));
        }
    }
}
