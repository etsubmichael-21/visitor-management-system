using EcxVisitorManagement.DTOs.Common;
using EcxVisitorManagement.DTOs.Notifications;

namespace EcxVisitorManagement.Interfaces;

public interface INotificationService
{
    Task<PagedResponse<NotificationResponseDto>> GetAllAsync(PageRequest request);
    Task<PagedResponse<NotificationResponseDto>> GetAllByEmployeeAsync(int employeeId, PageRequest request);
    Task<NotificationResponseDto?> GetByIdAsync(int id);
    Task<IReadOnlyList<NotificationResponseDto>> GetUnreadAsync();
    Task<IReadOnlyList<NotificationResponseDto>> GetUnreadByEmployeeAsync(int employeeId);
    Task<UnreadCountDto> GetUnreadCountAsync();
    Task<UnreadCountDto> GetUnreadCountByEmployeeAsync(int employeeId);
    Task MarkAsReadAsync(int id);
    Task MarkAllAsReadAsync();
    Task MarkAllAsReadByEmployeeAsync(int employeeId);
    Task DeleteAsync(int id);
    Task<PagedResponse<VisitorNotificationResponseDto>> GetVisitorNotificationsAsync(int visitorId, PageRequest request);
    Task<IReadOnlyList<VisitorNotificationResponseDto>> GetVisitorUnreadAsync(int visitorId);
    Task<UnreadCountDto> GetVisitorUnreadCountAsync(int visitorId);
    Task MarkVisitorNotificationReadAsync(int id);
    Task MarkAllVisitorNotificationsReadAsync(int visitorId);
}
