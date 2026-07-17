using EcxVisitorManagement.Models;

namespace EcxVisitorManagement.Interfaces;

public interface IVisitorRepository : IGenericRepository<Visitor>
{
    Task<Visitor?> GetByEmailAsync(string email);
    Task<Visitor?> GetByNationalIdAsync(string nationalId);
    Task<Visitor?> GetByPhoneAsync(string phone);
    Task<IReadOnlyList<Visitor>> SearchAsync(string query);
    Task<IReadOnlyList<Appointment>> GetAppointmentsAsync(int visitorId);
    Task<IReadOnlyList<Visit>> GetVisitsAsync(int visitorId);
}
