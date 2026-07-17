using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EcxVisitorManagement.DTOs.Common;
using EcxVisitorManagement.DTOs.Employees;
using EcxVisitorManagement.Interfaces;

namespace EcxVisitorManagement.Controllers;

[ApiController]
[Route("api/employees")]
[Authorize]
public class EmployeesController : ControllerBase
{
    private readonly IEmployeeService _employeeService;

    public EmployeesController(IEmployeeService employeeService) => _employeeService = employeeService;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] PageRequest request)
    {
        var result = await _employeeService.GetAllAsync(request);
        return Ok(ApiResponse<PagedResponse<EmployeeResponseDto>>.Ok(result));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _employeeService.GetByIdAsync(id);
        if (result == null) return NotFound(ApiResponse<EmployeeResponseDto>.NotFound("Employee not found"));
        return Ok(ApiResponse<EmployeeResponseDto>.Ok(result));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] EmployeeCreateDto dto)
    {
        var result = await _employeeService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<EmployeeResponseDto>.Created(result));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] EmployeeUpdateDto dto)
    {
        try
        {
            var result = await _employeeService.UpdateAsync(id, dto);
            return Ok(ApiResponse<EmployeeResponseDto>.Ok(result));
        }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse<EmployeeResponseDto>.NotFound(ex.Message)); }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _employeeService.DeleteAsync(id);
            return Ok(ApiResponse<object>.Ok(null!, "Deleted successfully"));
        }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse<object>.NotFound(ex.Message)); }
    }

    [HttpGet("{id}/schedule")]
    public async Task<IActionResult> GetSchedule(int id)
    {
        try
        {
            var result = await _employeeService.GetScheduleAsync(id);
            return Ok(ApiResponse<IReadOnlyList<EmployeeScheduleDto>>.Ok(result));
        }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse<IReadOnlyList<EmployeeScheduleDto>>.NotFound(ex.Message)); }
    }

    [HttpPut("{id}/schedule")]
    public async Task<IActionResult> UpdateSchedule(int id, [FromBody] EmployeeScheduleUpdateDto dto)
    {
        try
        {
            await _employeeService.UpdateScheduleAsync(id, dto);
            var result = await _employeeService.GetScheduleAsync(id);
            return Ok(ApiResponse<IReadOnlyList<EmployeeScheduleDto>>.Ok(result, "Schedule updated"));
        }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse<IReadOnlyList<EmployeeScheduleDto>>.NotFound(ex.Message)); }
    }

    [HttpPost("{id}/unavailability")]
    public async Task<IActionResult> AddUnavailability(int id, [FromBody] EmployeeUnavailabilityCreateDto dto)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            dto.EmployeeId = id;
            var result = await _employeeService.AddUnavailabilityAsync(dto, userId);
            return Ok(ApiResponse<EmployeeUnavailabilityResponseDto>.Ok(result, "Unavailability added"));
        }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse<EmployeeUnavailabilityResponseDto>.NotFound(ex.Message)); }
    }

    [HttpDelete("{id}/unavailability/{unavailabilityId}")]
    public async Task<IActionResult> RemoveUnavailability(int id, int unavailabilityId)
    {
        try
        {
            await _employeeService.RemoveUnavailabilityAsync(unavailabilityId);
            return Ok(ApiResponse<object>.Ok(null!, "Unavailability removed"));
        }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse<object>.NotFound(ex.Message)); }
    }

    [HttpGet("available")]
    public async Task<IActionResult> GetAvailable([FromQuery] DateOnly? date)
    {
        var result = await _employeeService.GetAvailableAsync(date ?? DateOnly.FromDateTime(DateTime.UtcNow));
        return Ok(ApiResponse<IReadOnlyList<EmployeeResponseDto>>.Ok(result));
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string q, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var request = new PageRequest { Page = page, PageSize = pageSize, Search = q };
        var result = await _employeeService.GetAllAsync(request);
        return Ok(ApiResponse<PagedResponse<EmployeeResponseDto>>.Ok(result));
    }
}
