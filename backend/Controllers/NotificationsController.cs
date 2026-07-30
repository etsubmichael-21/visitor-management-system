using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EcxVisitorManagement.DTOs.Common;
using EcxVisitorManagement.DTOs.Notifications;
using EcxVisitorManagement.Extensions;
using EcxVisitorManagement.Interfaces;

namespace EcxVisitorManagement.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService) => _notificationService = notificationService;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] PageRequest request)
    {
        if (User.IsAdminOrHigher())
        {
            var result = await _notificationService.GetAllAsync(request);
            return Ok(ApiResponse<PagedResponse<NotificationResponseDto>>.Ok(result));
        }

        var employeeId = User.GetEmployeeId();
        if (employeeId == null)
            return Ok(ApiResponse<PagedResponse<NotificationResponseDto>>.Ok(
                new PagedResponse<NotificationResponseDto> { Items = new List<NotificationResponseDto>(), TotalCount = 0, Page = 1, PageSize = 10 }));

        var empResult = await _notificationService.GetAllByEmployeeAsync(employeeId.Value, request);
        return Ok(ApiResponse<PagedResponse<NotificationResponseDto>>.Ok(empResult));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _notificationService.GetByIdAsync(id);
        if (result == null) return NotFound(ApiResponse<NotificationResponseDto>.NotFound("Notification not found"));
        return Ok(ApiResponse<NotificationResponseDto>.Ok(result));
    }

    [HttpGet("unread")]
    public async Task<IActionResult> GetUnread()
    {
        var employeeId = User.GetEmployeeId();
        if (User.IsAdminOrHigher())
        {
            var result = await _notificationService.GetUnreadAsync();
            return Ok(ApiResponse<IReadOnlyList<NotificationResponseDto>>.Ok(result));
        }

        if (employeeId == null)
            return Ok(ApiResponse<IReadOnlyList<NotificationResponseDto>>.Ok(new List<NotificationResponseDto>()));

        var empResult = await _notificationService.GetUnreadByEmployeeAsync(employeeId.Value);
        return Ok(ApiResponse<IReadOnlyList<NotificationResponseDto>>.Ok(empResult));
    }

    [HttpGet("unread/count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        if (User.IsAdminOrHigher())
        {
            var count = await _notificationService.GetUnreadCountAsync();
            return Ok(ApiResponse<UnreadCountDto>.Ok(count));
        }

        var employeeId = User.GetEmployeeId();
        if (employeeId == null)
            return Ok(ApiResponse<UnreadCountDto>.Ok(new UnreadCountDto { Count = 0 }));

        var empCount = await _notificationService.GetUnreadCountByEmployeeAsync(employeeId.Value);
        return Ok(ApiResponse<UnreadCountDto>.Ok(empCount));
    }

    [HttpPost("{id}/read")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        try
        {
            await _notificationService.MarkAsReadAsync(id);
            return Ok(ApiResponse<object>.Ok(null!, "Marked as read"));
        }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse<object>.NotFound(ex.Message)); }
    }

    [HttpPost("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        if (User.IsAdminOrHigher())
        {
            await _notificationService.MarkAllAsReadAsync();
        }
        else
        {
            var employeeId = User.GetEmployeeId();
            if (employeeId != null)
                await _notificationService.MarkAllAsReadByEmployeeAsync(employeeId.Value);
        }
        return Ok(ApiResponse<object>.Ok(null!, "All notifications marked as read"));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _notificationService.DeleteAsync(id);
            return Ok(ApiResponse<object>.Ok(null!, "Deleted successfully"));
        }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse<object>.NotFound(ex.Message)); }
    }

    [HttpGet("visitor/{visitorId}")]
    public async Task<IActionResult> GetVisitorNotifications(int visitorId, [FromQuery] PageRequest request)
    {
        var result = await _notificationService.GetVisitorNotificationsAsync(visitorId, request);
        return Ok(ApiResponse<PagedResponse<VisitorNotificationResponseDto>>.Ok(result));
    }

    [HttpGet("visitor/{visitorId}/unread")]
    public async Task<IActionResult> GetVisitorUnread(int visitorId)
    {
        var result = await _notificationService.GetVisitorUnreadAsync(visitorId);
        return Ok(ApiResponse<IReadOnlyList<VisitorNotificationResponseDto>>.Ok(result));
    }

    [HttpPost("visitor/{visitorId}/read/{notificationId}")]
    public async Task<IActionResult> MarkVisitorNotificationRead(int visitorId, int notificationId)
    {
        try
        {
            await _notificationService.MarkVisitorNotificationReadAsync(notificationId);
            return Ok(ApiResponse<object>.Ok(null!, "Marked as read"));
        }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse<object>.NotFound(ex.Message)); }
    }

    [HttpPost("visitor/{visitorId}/read-all")]
    public async Task<IActionResult> MarkAllVisitorNotificationsRead(int visitorId)
    {
        await _notificationService.MarkAllVisitorNotificationsReadAsync(visitorId);
        return Ok(ApiResponse<object>.Ok(null!, "All notifications marked as read"));
    }

    [HttpGet("visitor/{visitorId}/unread/count")]
    public async Task<IActionResult> GetVisitorUnreadCount(int visitorId)
    {
        var count = await _notificationService.GetVisitorUnreadCountAsync(visitorId);
        return Ok(ApiResponse<UnreadCountDto>.Ok(count));
    }
}
