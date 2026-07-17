using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EcxVisitorManagement.DTOs.Common;
using EcxVisitorManagement.DTOs.Dashboard;
using EcxVisitorManagement.Interfaces;

namespace EcxVisitorManagement.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService) => _dashboardService = dashboardService;

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var result = await _dashboardService.GetStatsAsync();
        return Ok(ApiResponse<DashboardStatsDto>.Ok(result));
    }

    [HttpGet("admin")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAdminDashboard()
    {
        var result = await _dashboardService.GetAdminDashboardAsync();
        return Ok(ApiResponse<AdminDashboardDto>.Ok(result));
    }

    [HttpGet("ceo")]
    [Authorize(Roles = "CEO")]
    public async Task<IActionResult> GetCeoDashboard()
    {
        var result = await _dashboardService.GetCeoDashboardAsync();
        return Ok(ApiResponse<CeoDashboardDto>.Ok(result));
    }

    [HttpGet("department-head")]
    [Authorize(Roles = "DepartmentHead")]
    public async Task<IActionResult> GetDepartmentHeadDashboard()
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
        var result = await _dashboardService.GetDepartmentHeadDashboardAsync(userId);
        return Ok(ApiResponse<DepartmentHeadDashboardDto>.Ok(result));
    }

    [HttpGet("employee")]
    public async Task<IActionResult> GetEmployeeDashboard()
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
        var result = await _dashboardService.GetEmployeeDashboardAsync(userId);
        return Ok(ApiResponse<EmployeeDashboardDto>.Ok(result));
    }

    [HttpGet("receptionist")]
    [Authorize(Roles = "Receptionist,Admin")]
    public async Task<IActionResult> GetReceptionistDashboard()
    {
        var result = await _dashboardService.GetReceptionistDashboardAsync();
        return Ok(ApiResponse<ReceptionistDashboardDto>.Ok(result));
    }

    [HttpGet("security")]
    [Authorize(Roles = "Security,Admin")]
    public async Task<IActionResult> GetSecurityDashboard()
    {
        var result = await _dashboardService.GetSecurityDashboardAsync();
        return Ok(ApiResponse<SecurityDashboardDto>.Ok(result));
    }
}
