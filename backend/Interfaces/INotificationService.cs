using EcxVisitorManagement.DTOs.Common;
using EcxVisitorManagement.DTOs.Notifications;

namespace EcxVisitorManagement.Interfaces;

public interface INotificationService
{
    Task<PagedResponse<NotificationResponseDto>> GetAllAsync(PageRequest request);
    Task<NotificationResponseDto?> GetByIdAsync(int id);
    Task<IReadOnlyList<NotificationResponseDto>> GetUnreadAsync();
    Task<UnreadCountDto> GetUnreadCountAsync();
    Task MarkAsReadAsync(int id);
    Task MarkAllAsReadAsync();
    Task DeleteAsync(int id);
    Task<PagedResponse<VisitorNotificationResponseDto>> GetVisitorNotificationsAsync(int visitorId, PageRequest request);
    Task<IReadOnlyList<VisitorNotificationResponseDto>> GetVisitorUnreadAsync(int visitorId);
    Task<UnreadCountDto> GetVisitorUnreadCountAsync(int visitorId);
    Task MarkVisitorNotificationReadAsync(int id);
    Task MarkAllVisitorNotificationsReadAsync(int visitorId);
}
