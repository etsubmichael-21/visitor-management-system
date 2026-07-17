using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EcxVisitorManagement.DTOs.Common;
using EcxVisitorManagement.DTOs.Departments;
using EcxVisitorManagement.Interfaces;

namespace EcxVisitorManagement.Controllers;

[ApiController]
[Route("api/departments")]
[Authorize]
public class DepartmentsController : ControllerBase
{
    private readonly IDepartmentService _departmentService;

    public DepartmentsController(IDepartmentService departmentService) => _departmentService = departmentService;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] PageRequest request)
    {
        var result = await _departmentService.GetAllAsync(request);
        return Ok(ApiResponse<PagedResponse<DepartmentResponseDto>>.Ok(result));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _departmentService.GetByIdAsync(id);
        if (result == null) return NotFound(ApiResponse<DepartmentResponseDto>.NotFound("Department not found"));
        return Ok(ApiResponse<DepartmentResponseDto>.Ok(result));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] DepartmentCreateDto dto)
    {
        var result = await _departmentService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<DepartmentResponseDto>.Created(result));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] DepartmentUpdateDto dto)
    {
        try
        {
            var result = await _departmentService.UpdateAsync(id, dto);
            return Ok(ApiResponse<DepartmentResponseDto>.Ok(result));
        }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse<DepartmentResponseDto>.NotFound(ex.Message)); }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _departmentService.DeleteAsync(id);
            return Ok(ApiResponse<object>.Ok(null!, "Deleted successfully"));
        }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse<object>.NotFound(ex.Message)); }
    }

    [HttpGet("{id}/stats")]
    public async Task<IActionResult> GetStats(int id)
    {
        try
        {
            var result = await _departmentService.GetStatsAsync(id);
            return Ok(ApiResponse<DepartmentStatsDto>.Ok(result));
        }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse<DepartmentStatsDto>.NotFound(ex.Message)); }
    }

    [HttpGet("active")]
    public async Task<IActionResult> GetActive()
    {
        var result = await _departmentService.GetAllAsync(new PageRequest { PageSize = 100 });
        return Ok(ApiResponse<PagedResponse<DepartmentResponseDto>>.Ok(result));
    }
}
