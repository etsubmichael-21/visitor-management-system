using EcxVisitorManagement.DTOs.Dashboard;

namespace EcxVisitorManagement.Interfaces;

public interface IDashboardService
{
    Task<DashboardStatsDto> GetStatsAsync();
    Task<AdminDashboardDto> GetAdminDashboardAsync();
    Task<CeoDashboardDto> GetCeoDashboardAsync();
    Task<DepartmentHeadDashboardDto> GetDepartmentHeadDashboardAsync(int departmentId);
    Task<EmployeeDashboardDto> GetEmployeeDashboardAsync(int employeeId);
    Task<ReceptionistDashboardDto> GetReceptionistDashboardAsync();
    Task<SecurityDashboardDto> GetSecurityDashboardAsync();
}
