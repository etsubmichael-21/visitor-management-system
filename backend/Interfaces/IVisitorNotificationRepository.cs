using EcxVisitorManagement.Models;

namespace EcxVisitorManagement.Interfaces;

public interface IVisitorNotificationRepository : IGenericRepository<VisitorNotification>
{
    Task<IReadOnlyList<VisitorNotification>> GetByVisitorIdAsync(int visitorId);
    Task<IReadOnlyList<VisitorNotification>> GetUnreadByVisitorIdAsync(int visitorId);
    Task<int> CountUnreadAsync(int visitorId);
    Task MarkAsReadAsync(int id);
    Task MarkAllAsReadAsync(int visitorId);
}
