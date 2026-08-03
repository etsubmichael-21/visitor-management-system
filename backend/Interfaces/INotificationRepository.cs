using EcxVisitorManagement.Models;

namespace EcxVisitorManagement.Interfaces;

public interface INotificationRepository : IGenericRepository<Notification>
{
    Task<IReadOnlyList<Notification>> GetByEmployeeIdAsync(int employeeId);
    Task<IReadOnlyList<Notification>> GetByEmployeeIdsAsync(IEnumerable<int> employeeIds);
    Task<IReadOnlyList<Notification>> GetUnreadByEmployeeIdAsync(int employeeId);
    Task<IReadOnlyList<Notification>> GetUnreadByEmployeeIdsAsync(IEnumerable<int> employeeIds);
    Task<int> CountUnreadAsync(int employeeId);
    Task<int> CountUnreadByEmployeeIdsAsync(IEnumerable<int> employeeIds);
    Task MarkAsReadAsync(int id);
    Task MarkAllAsReadAsync(int employeeId);
    Task MarkAllAsReadByEmployeeIdsAsync(IEnumerable<int> employeeIds);
}
