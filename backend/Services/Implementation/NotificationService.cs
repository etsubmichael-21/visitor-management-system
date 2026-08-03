using EcxVisitorManagement.DTOs.Common;
using EcxVisitorManagement.DTOs.Notifications;
using EcxVisitorManagement.Interfaces;

namespace EcxVisitorManagement.Services.Implementation;

public class NotificationService : INotificationService
{
    private readonly INotificationRepository _repository;
    private readonly IVisitorNotificationRepository _visitorRepository;

    public NotificationService(INotificationRepository repository, IVisitorNotificationRepository visitorRepository) { _repository = repository; _visitorRepository = visitorRepository; }

    public async Task<PagedResponse<NotificationResponseDto>> GetAllAsync(PageRequest request)
    {
        var paged = await _repository.GetPagedAsync(request);
        return new PagedResponse<NotificationResponseDto> { Items = paged.Items.Select(MapToDto).ToList(), TotalCount = paged.TotalCount, Page = paged.Page, PageSize = paged.PageSize };
    }

    public async Task<PagedResponse<NotificationResponseDto>> GetAllByEmployeeAsync(int employeeId, PageRequest request)
    {
        var all = await _repository.GetByEmployeeIdAsync(employeeId);
        var pagedItems = all.Skip((request.Page - 1) * request.PageSize).Take(request.PageSize).ToList();
        return new PagedResponse<NotificationResponseDto>
        {
            Items = pagedItems.Select(MapToDto).ToList(),
            TotalCount = all.Count,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }

    public async Task<PagedResponse<NotificationResponseDto>> GetAllByEmployeesAsync(IEnumerable<int> employeeIds, PageRequest request)
    {
        var all = await _repository.GetByEmployeeIdsAsync(employeeIds);
        var pagedItems = all.Skip((request.Page - 1) * request.PageSize).Take(request.PageSize).ToList();
        return new PagedResponse<NotificationResponseDto>
        {
            Items = pagedItems.Select(MapToDto).ToList(),
            TotalCount = all.Count,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }

    public async Task<NotificationResponseDto?> GetByIdAsync(int id) { var n = await _repository.GetByIdAsync(id); return n == null ? null : MapToDto(n); }
    public async Task<IReadOnlyList<NotificationResponseDto>> GetUnreadAsync() => (await _repository.GetUnreadByEmployeeIdAsync(0)).Select(MapToDto).ToList();
    public async Task<IReadOnlyList<NotificationResponseDto>> GetUnreadByEmployeeAsync(int employeeId) => (await _repository.GetUnreadByEmployeeIdAsync(employeeId)).Select(MapToDto).ToList();
    public async Task<IReadOnlyList<NotificationResponseDto>> GetUnreadByEmployeesAsync(IEnumerable<int> employeeIds) => (await _repository.GetUnreadByEmployeeIdsAsync(employeeIds)).Select(MapToDto).ToList();
    public async Task<UnreadCountDto> GetUnreadCountAsync() => new() { Count = await _repository.CountUnreadAsync(0) };
    public async Task<UnreadCountDto> GetUnreadCountByEmployeeAsync(int employeeId) => new() { Count = await _repository.CountUnreadAsync(employeeId) };
    public async Task<UnreadCountDto> GetUnreadCountByEmployeesAsync(IEnumerable<int> employeeIds) => new() { Count = await _repository.CountUnreadByEmployeeIdsAsync(employeeIds) };
    public async Task MarkAsReadAsync(int id) => await _repository.MarkAsReadAsync(id);
    public async Task MarkAllAsReadAsync() => await _repository.MarkAllAsReadAsync(0);
    public async Task MarkAllAsReadByEmployeeAsync(int employeeId) => await _repository.MarkAllAsReadAsync(employeeId);
    public async Task MarkAllAsReadByEmployeesAsync(IEnumerable<int> employeeIds) => await _repository.MarkAllAsReadByEmployeeIdsAsync(employeeIds);
    public async Task DeleteAsync(int id) { var n = await _repository.GetByIdAsync(id) ?? throw new KeyNotFoundException("Notification not found"); await _repository.DeleteAsync(n); }

    public async Task<PagedResponse<VisitorNotificationResponseDto>> GetVisitorNotificationsAsync(int visitorId, PageRequest request)
    {
        var all = await _visitorRepository.GetByVisitorIdAsync(visitorId);
        var pagedItems = all.Skip((request.Page - 1) * request.PageSize).Take(request.PageSize).ToList();
        return new PagedResponse<VisitorNotificationResponseDto>
        {
            Items = pagedItems.Select(MapVisitorNotificationToDto).ToList(),
            TotalCount = all.Count,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }

    public async Task<IReadOnlyList<VisitorNotificationResponseDto>> GetVisitorUnreadAsync(int visitorId) => (await _visitorRepository.GetUnreadByVisitorIdAsync(visitorId)).Select(MapVisitorNotificationToDto).ToList();
    public async Task<UnreadCountDto> GetVisitorUnreadCountAsync(int visitorId) => new() { Count = await _visitorRepository.CountUnreadAsync(visitorId) };
    public async Task MarkVisitorNotificationReadAsync(int id) => await _visitorRepository.MarkAsReadAsync(id);
    public async Task MarkAllVisitorNotificationsReadAsync(int visitorId) => await _visitorRepository.MarkAllAsReadAsync(visitorId);

    private static NotificationResponseDto MapToDto(Models.Notification n) => new()
    {
        Id = n.Id, EmployeeId = n.EmployeeId, AppointmentId = n.AppointmentId, Title = n.Title, Message = n.Message,
        NotificationType = n.NotificationType, Priority = n.Priority, IsRead = n.IsRead, ReadAt = n.ReadAt,
        Channel = n.Channel, CreatedAt = n.CreatedAt
    };

    private static VisitorNotificationResponseDto MapVisitorNotificationToDto(Models.VisitorNotification n) => new()
    {
        Id = n.Id, VisitorId = n.VisitorId, AppointmentId = n.AppointmentId, Title = n.Title, Message = n.Message,
        NotificationType = n.NotificationType, IsRead = n.IsRead, ReadAt = n.ReadAt, Channel = n.Channel, CreatedAt = n.CreatedAt
    };
}
