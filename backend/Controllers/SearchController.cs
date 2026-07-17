using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EcxVisitorManagement.DTOs.Common;
using EcxVisitorManagement.DTOs.Employees;
using EcxVisitorManagement.DTOs.Visitors;
using EcxVisitorManagement.Interfaces;

namespace EcxVisitorManagement.Controllers;

[ApiController]
[Route("api/search")]
[Authorize]
public class SearchController : ControllerBase
{
    private readonly IVisitorService _visitorService;
    private readonly IEmployeeService _employeeService;

    public SearchController(IVisitorService visitorService, IEmployeeService employeeService)
    {
        _visitorService = visitorService;
        _employeeService = employeeService;
    }

    [HttpGet]
    public async Task<IActionResult> GlobalSearch([FromQuery] string q, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var visitorsTask = _visitorService.GetAllAsync(new PageRequest { Page = page, PageSize = pageSize, Search = q });
        var employeesTask = _employeeService.GetAllAsync(new PageRequest { Page = page, PageSize = pageSize, Search = q });

        await Task.WhenAll(visitorsTask, employeesTask);

        return Ok(ApiResponse<object>.Ok(new
        {
            visitors = visitorsTask.Result,
            employees = employeesTask.Result
        }));
    }

    [HttpGet("visitors")]
    public async Task<IActionResult> SearchVisitors([FromQuery] string q, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var request = new PageRequest { Page = page, PageSize = pageSize, Search = q };
        var result = await _visitorService.GetAllAsync(request);
        return Ok(ApiResponse<PagedResponse<VisitorResponseDto>>.Ok(result));
    }

    [HttpGet("employees")]
    public async Task<IActionResult> SearchEmployees([FromQuery] string q, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var request = new PageRequest { Page = page, PageSize = pageSize, Search = q };
        var result = await _employeeService.GetAllAsync(request);
        return Ok(ApiResponse<PagedResponse<EmployeeResponseDto>>.Ok(result));
    }
}
