using EcxVisitorManagement.Models;
using EcxVisitorManagement.DTOs.Common;

namespace EcxVisitorManagement.Interfaces;

public interface IAppointmentRepository : IGenericRepository<Appointment>
{
    Task<PagedResponse<Appointment>> GetPagedByEmployeeIdAsync(int employeeId, PageRequest request);
    Task<PagedResponse<Appointment>> GetPagedByDepartmentIdAsync(int departmentId, PageRequest request);
    Task<PagedResponse<Appointment>> GetPagedByVisitorIdAsync(int visitorId, PageRequest request);
    Task<IReadOnlyList<Appointment>> GetByVisitorIdAsync(int visitorId);
    Task<IReadOnlyList<Appointment>> GetByEmployeeIdAsync(int employeeId);
    Task<IReadOnlyList<Appointment>> GetByEmployeeAndDateAsync(int employeeId, DateOnly date);
    Task<IReadOnlyList<Appointment>> GetPendingAsync();
    Task<IReadOnlyList<Appointment>> GetPendingByEmployeeIdAsync(int employeeId);
    Task<IReadOnlyList<Appointment>> GetTodayAsync();
    Task<IReadOnlyList<Appointment>> GetTodayByEmployeeIdAsync(int employeeId);
    Task<IReadOnlyList<Appointment>> GetByStatusAsync(string status);
    Task<IReadOnlyList<Appointment>> GetByDepartmentIdAsync(int departmentId);
    Task<Appointment?> GetByCodeAsync(string code);
    Task<IReadOnlyList<Appointment>> GetConfidentialAsync();
    Task<IReadOnlyList<Appointment>> GetConfidentialByDepartmentIdAsync(int departmentId);
    Task<IReadOnlyList<Appointment>> GetPendingByDepartmentAsync(int departmentId);
    Task<IReadOnlyList<Appointment>> GetTodayByDepartmentIdAsync(int departmentId);
    Task<int> CountByStatusAsync(string status);
    Task<int> CountByDateRangeAsync(DateOnly start, DateOnly end);
    Task<IReadOnlyList<Appointment>> GetByDateRangeAsync(DateOnly start, DateOnly end);
    Task<IReadOnlyList<Appointment>> GetOverduePendingAsync(DateOnly beforeDate);
}
