using EcxVisitorManagement.Models;

namespace EcxVisitorManagement.Interfaces;

public interface IAppointmentRepository : IGenericRepository<Appointment>
{
    Task<IReadOnlyList<Appointment>> GetByVisitorIdAsync(int visitorId);
    Task<IReadOnlyList<Appointment>> GetByEmployeeIdAsync(int employeeId);
    Task<IReadOnlyList<Appointment>> GetPendingAsync();
    Task<IReadOnlyList<Appointment>> GetTodayAsync();
    Task<IReadOnlyList<Appointment>> GetByStatusAsync(string status);
    Task<IReadOnlyList<Appointment>> GetByDepartmentIdAsync(int departmentId);
    Task<Appointment?> GetByCodeAsync(string code);
    Task<IReadOnlyList<Appointment>> GetConfidentialAsync();
    Task<IReadOnlyList<Appointment>> GetPendingByDepartmentAsync(int departmentId);
    Task<int> CountByStatusAsync(string status);
    Task<int> CountByDateRangeAsync(DateOnly start, DateOnly end);
    Task<IReadOnlyList<Appointment>> GetByDateRangeAsync(DateOnly start, DateOnly end);
    Task<IReadOnlyList<Appointment>> GetOverduePendingAsync(DateOnly beforeDate);
}
