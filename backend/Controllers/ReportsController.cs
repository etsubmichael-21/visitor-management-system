using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EcxVisitorManagement.DTOs.Common;
using EcxVisitorManagement.DTOs.Reports;
using EcxVisitorManagement.Interfaces;

namespace EcxVisitorManagement.Controllers;

[ApiController]
[Route("api/reports")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService) => _reportService = reportService;

    [HttpGet("visitors")]
    public async Task<IActionResult> GetVisitorReport([FromQuery] ReportFilterDto filter)
    {
        var result = await _reportService.GetVisitorReportAsync(filter);
        return Ok(ApiResponse<VisitorReportDto>.Ok(result));
    }

    [HttpGet("appointments")]
    public async Task<IActionResult> GetAppointmentReport([FromQuery] ReportFilterDto filter)
    {
        var result = await _reportService.GetAppointmentReportAsync(filter);
        return Ok(ApiResponse<AppointmentReportDto>.Ok(result));
    }

    [HttpGet("departments")]
    public async Task<IActionResult> GetDepartmentReport([FromQuery] ReportFilterDto filter)
    {
        var result = await _reportService.GetDepartmentReportAsync(filter);
        return Ok(ApiResponse<List<DepartmentReportDto>>.Ok(result));
    }

    [HttpGet("employees")]
    public async Task<IActionResult> GetEmployeeReport([FromQuery] ReportFilterDto filter)
    {
        var result = await _reportService.GetEmployeeReportAsync(filter);
        return Ok(ApiResponse<List<EmployeeReportDto>>.Ok(result));
    }

    [HttpGet("export/visitors")]
    public async Task<IActionResult> ExportVisitors([FromQuery] ReportFilterDto filter)
    {
        var fileBytes = await _reportService.ExportVisitorsAsync(filter);
        return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "visitors-report.xlsx");
    }

    [HttpGet("export/appointments")]
    public async Task<IActionResult> ExportAppointments([FromQuery] ReportFilterDto filter)
    {
        var fileBytes = await _reportService.ExportAppointmentsAsync(filter);
        return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "appointments-report.xlsx");
    }

    [HttpGet("export/visits")]
    public async Task<IActionResult> ExportVisits([FromQuery] ReportFilterDto filter)
    {
        var fileBytes = await _reportService.ExportVisitsAsync(filter);
        return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "visits-report.xlsx");
    }
}
