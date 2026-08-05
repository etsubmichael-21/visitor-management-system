using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EcxVisitorManagement.Data;
using EcxVisitorManagement.DTOs.Common;
using EcxVisitorManagement.DTOs.Employees;
using EcxVisitorManagement.Interfaces;
using EcxVisitorManagement.Models;

namespace EcxVisitorManagement.Controllers;

[ApiController]
[Route("api/employee-unavailability")]
[Authorize]
public class EmployeeUnavailabilityController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IAppointmentService _appointmentService;

    public EmployeeUnavailabilityController(AppDbContext context, IAppointmentService appointmentService)
    {
        _context = context;
        _appointmentService = appointmentService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? employeeId)
    {
        var query = _context.EmployeeUnavailabilities
            .Include(u => u.Employee)
            .AsQueryable();

        if (employeeId.HasValue)
            query = query.Where(u => u.EmployeeId == employeeId.Value);

        var items = await query.OrderByDescending(u => u.CreatedAt).ToListAsync();
        var dtos = items.Select(MapToDto).ToList();
        return Ok(ApiResponse<List<EmployeeUnavailabilityDto>>.Ok(dtos));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = await _context.EmployeeUnavailabilities
            .Include(u => u.Employee)
            .FirstOrDefaultAsync(u => u.Id == id);
        if (item == null) return NotFound(ApiResponse<EmployeeUnavailabilityDto>.NotFound("Not found"));
        return Ok(ApiResponse<EmployeeUnavailabilityDto>.Ok(MapToDto(item)));
    }

    [HttpPost]
    [Authorize(Roles = "Admin,CEO,DepartmentHead,Employee")]
    public async Task<IActionResult> Create([FromBody] CreateEmployeeUnavailabilityDto dto)
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);

        var entity = new EmployeeUnavailability
        {
            EmployeeId = dto.EmployeeId,
            UnavailabilityType = dto.UnavailabilityType,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            StartTime = dto.StartTime,
            EndTime = dto.EndTime,
            Repeat = string.IsNullOrWhiteSpace(dto.Repeat) ? "None" : dto.Repeat,
            Reason = dto.Reason,
            CreatedBy = userId,
            CreatedAt = DateTimeOffset.UtcNow
        };
        _context.EmployeeUnavailabilities.Add(entity);
        await _context.SaveChangesAsync();

        await _appointmentService.HandleEmployeeUnavailabilityAsync(
            dto.EmployeeId, dto.UnavailabilityType, dto.StartDate, dto.EndDate, dto.StartTime, dto.EndTime, dto.Reason, userId);

        var created = await _context.EmployeeUnavailabilities
            .Include(u => u.Employee)
            .FirstAsync(u => u.Id == entity.Id);

        return CreatedAtAction(nameof(GetById), new { id = entity.Id },
            ApiResponse<EmployeeUnavailabilityDto>.Ok(MapToDto(created)));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,CEO,DepartmentHead,Employee")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateEmployeeUnavailabilityDto dto)
    {
        var entity = await _context.EmployeeUnavailabilities.FindAsync(id);
        if (entity == null) return NotFound(ApiResponse<EmployeeUnavailabilityDto>.NotFound("Not found"));

        var currentUser = await _context.Users.FindAsync(
            int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value));
        var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        var isManager = role is "Admin" or "CEO" or "DepartmentHead";
        if (!isManager && currentUser?.EmployeeId != entity.EmployeeId)
            return Forbid();

        entity.UnavailabilityType = dto.UnavailabilityType;
        entity.StartDate = dto.StartDate;
        entity.EndDate = dto.EndDate;
        entity.StartTime = dto.StartTime;
        entity.EndTime = dto.EndTime;
        entity.Repeat = string.IsNullOrWhiteSpace(dto.Repeat) ? "None" : dto.Repeat;
        entity.Reason = dto.Reason;
        entity.UpdatedAt = DateTimeOffset.UtcNow;
        await _context.SaveChangesAsync();

        await _appointmentService.HandleEmployeeUnavailabilityAsync(
            entity.EmployeeId, entity.UnavailabilityType, entity.StartDate, entity.EndDate, entity.StartTime, entity.EndTime, entity.Reason, currentUser?.Id ?? 0);

        var updated = await _context.EmployeeUnavailabilities
            .Include(u => u.Employee)
            .FirstAsync(u => u.Id == entity.Id);

        return Ok(ApiResponse<EmployeeUnavailabilityDto>.Ok(MapToDto(updated)));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,CEO,DepartmentHead,Employee")]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await _context.EmployeeUnavailabilities.FindAsync(id);
        if (entity == null) return NotFound(ApiResponse<object>.NotFound("Not found"));

        var currentUser = await _context.Users.FindAsync(
            int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value));
        var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        var isManager = role is "Admin" or "CEO" or "DepartmentHead";
        if (!isManager && currentUser?.EmployeeId != entity.EmployeeId)
            return Forbid();

        _context.EmployeeUnavailabilities.Remove(entity);
        await _context.SaveChangesAsync();
        return Ok(ApiResponse<object>.Ok(null!, "Deleted successfully"));
    }

    private static EmployeeUnavailabilityDto MapToDto(EmployeeUnavailability u) => new()
    {
        Id = u.Id,
        EmployeeId = u.EmployeeId,
        EmployeeName = u.Employee?.FullName ?? "",
        UnavailabilityType = u.UnavailabilityType,
        StartDate = u.StartDate,
        EndDate = u.EndDate,
        StartTime = u.StartTime,
        EndTime = u.EndTime,
        Repeat = u.Repeat,
        Reason = u.Reason,
        CreatedAt = u.CreatedAt,
        UpdatedAt = u.UpdatedAt
    };
}
