using EcxVisitorManagement.DTOs.Dashboard;

namespace EcxVisitorManagement.Interfaces;

public interface IDashboardService
{
    Task<DashboardStatsDto> GetStatsAsync();
    Task<AdminDashboardDto> GetAdminDashboardAsync();
    Task<CeoDashboardDto> GetCeoDashboardAsync();
    Task<DepartmentHeadDashboardDto> GetDepartmentHeadDashboardAsync(int departmentId);
    Task<EmployeeDashboardDto> GetEmployeeDashboardAsync(int employeeId);
    Task<RoleDashboardDto> GetReceptionistDashboardAsync();
    Task<RoleDashboardDto> GetSecurityDashboardAsync();
    Task<VisitorDashboardDto> GetVisitorDashboardAsync(int visitorId);
}
