using EcxVisitorManagement.Models;

namespace EcxVisitorManagement.Interfaces;

public interface IDepartmentRepository : IGenericRepository<Department>
{
    Task<Department?> GetByNameAsync(string name);
    Task<IReadOnlyList<Department>> GetActiveDepartmentsAsync();
}
