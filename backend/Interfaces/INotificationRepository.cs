using EcxVisitorManagement.Models;

namespace EcxVisitorManagement.Interfaces;

public interface INotificationRepository : IGenericRepository<Notification>
{
    Task<IReadOnlyList<Notification>> GetByEmployeeIdAsync(int employeeId);
    Task<IReadOnlyList<Notification>> GetUnreadByEmployeeIdAsync(int employeeId);
    Task<int> CountUnreadAsync(int employeeId);
    Task MarkAsReadAsync(int id);
    Task MarkAllAsReadAsync(int employeeId);
}
