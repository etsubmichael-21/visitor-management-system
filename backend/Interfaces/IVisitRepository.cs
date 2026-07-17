using EcxVisitorManagement.Models;

namespace EcxVisitorManagement.Interfaces;

public interface IVisitRepository : IGenericRepository<Visit>
{
    Task<IReadOnlyList<Visit>> GetByVisitorIdAsync(int visitorId);
    Task<IReadOnlyList<Visit>> GetByEmployeeIdAsync(int employeeId);
    Task<IReadOnlyList<Visit>> GetTodayVisitsAsync();
    Task<IReadOnlyList<Visit>> GetActiveVisitsAsync();
    Task<Visit?> GetWithItemsAsync(int id);
    Task<int> CountTodayAsync();
    Task<int> CountCheckedInAsync();
}
