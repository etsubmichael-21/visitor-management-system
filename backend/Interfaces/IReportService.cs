using EcxVisitorManagement.DTOs.Reports;

namespace EcxVisitorManagement.Interfaces;

public interface IReportService
{
    Task<VisitorReportDto> GetVisitorReportAsync(ReportFilterDto filter);
    Task<AppointmentReportDto> GetAppointmentReportAsync(ReportFilterDto filter);
    Task<List<DepartmentReportDto>> GetDepartmentReportAsync(ReportFilterDto filter);
    Task<List<EmployeeReportDto>> GetEmployeeReportAsync(ReportFilterDto filter);
    Task<byte[]> ExportVisitorsAsync(ReportFilterDto filter);
    Task<byte[]> ExportAppointmentsAsync(ReportFilterDto filter);
    Task<byte[]> ExportVisitsAsync(ReportFilterDto filter);
}
