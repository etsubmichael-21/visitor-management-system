using EcxVisitorManagement.Models;

namespace EcxVisitorManagement.Interfaces;

public interface IEmployeeRepository : IGenericRepository<Employee>
{
    Task<Employee?> GetByEmailAsync(string email);
    Task<IReadOnlyList<Employee>> GetByDepartmentIdAsync(int departmentId);
    Task<IReadOnlyList<Employee>> GetAvailableEmployeesAsync();
    Task<Employee?> GetWithSchedulesAsync(int id);
    Task<IReadOnlyList<Employee>> SearchAsync(string query);
    Task<bool> IsAvailableOnDateAsync(int employeeId, DateOnly date);
    Task<IReadOnlyList<Employee>> GetByUserIdAsync(int userId);
}
