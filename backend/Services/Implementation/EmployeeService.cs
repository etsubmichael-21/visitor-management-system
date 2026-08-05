using Microsoft.EntityFrameworkCore;
using EcxVisitorManagement.Data;
using EcxVisitorManagement.DTOs.Common;
using EcxVisitorManagement.DTOs.Employees;
using EcxVisitorManagement.Interfaces;
using EcxVisitorManagement.Models;

namespace EcxVisitorManagement.Services.Implementation;

public class EmployeeService : IEmployeeService
{
    private readonly IEmployeeRepository _repository;
    private readonly AppDbContext _context;
    public EmployeeService(IEmployeeRepository repository, AppDbContext context) { _repository = repository; _context = context; }

    public async Task<PagedResponse<EmployeeResponseDto>> GetAllAsync(PageRequest request)
    {
        var paged = await _repository.GetPagedAsync(request);
        return new PagedResponse<EmployeeResponseDto> { Items = paged.Items.Select(MapToDto).ToList(), TotalCount = paged.TotalCount, Page = paged.Page, PageSize = paged.PageSize };
    }

    public async Task<EmployeeResponseDto?> GetByIdAsync(int id) { var e = await _repository.GetByIdAsync(id); return e == null ? null : MapToDto(e); }

    public async Task<EmployeeResponseDto> CreateAsync(EmployeeCreateDto dto)
    {
        if (await _repository.ExistsAsync(e => e.Email == dto.Email)) throw new InvalidOperationException("Email already exists");
        var employee = new Employee { FullName = dto.FullName, Phone = dto.Phone, Email = dto.Email, DepartmentId = dto.DepartmentId, Position = dto.Position, OfficeNumber = dto.OfficeNumber, Status = "Active", CreatedAt = DateTimeOffset.UtcNow };
        var created = await _repository.AddAsync(employee);
        return MapToDto(created);
    }

    public async Task<EmployeeResponseDto> UpdateAsync(int id, EmployeeUpdateDto dto)
    {
        var employee = await _repository.GetByIdAsync(id) ?? throw new KeyNotFoundException("Employee not found");
        if (dto.FullName != null) employee.FullName = dto.FullName;
        if (dto.Phone != null) employee.Phone = dto.Phone;
        if (dto.DepartmentId != null) employee.DepartmentId = int.Parse(dto.DepartmentId);
        if (dto.Position != null) employee.Position = dto.Position;
        if (dto.OfficeNumber != null) employee.OfficeNumber = dto.OfficeNumber;
        if (dto.Status != null) employee.Status = dto.Status;
        employee.UpdatedAt = DateTimeOffset.UtcNow;
        await _repository.UpdateAsync(employee);
        return MapToDto(employee);
    }

    public async Task DeleteAsync(int id) { var e = await _repository.GetByIdAsync(id) ?? throw new KeyNotFoundException("Employee not found"); await _repository.DeleteAsync(e); }

    public async Task<List<EmployeeScheduleDto>> GetScheduleAsync(int employeeId)
    {
        var employee = await _repository.GetWithSchedulesAsync(employeeId) ?? throw new KeyNotFoundException("Employee not found");
        return employee.Schedules.Select(s => new EmployeeScheduleDto { Id = s.Id, DayOfWeek = s.DayOfWeek, StartTime = s.StartTime, EndTime = s.EndTime, BreakStart = s.BreakStart, BreakEnd = s.BreakEnd, IsAvailable = s.IsAvailable, MaxAppointments = s.MaxAppointments, Notes = s.Notes }).ToList();
    }

    public async Task UpdateScheduleAsync(int employeeId, EmployeeScheduleUpdateDto dto)
    {
        var existing = await _context.EmployeeSchedules.Where(s => s.EmployeeId == employeeId).ToListAsync();
        _context.EmployeeSchedules.RemoveRange(existing);
        foreach (var s in dto.Schedules)
        {
            _context.EmployeeSchedules.Add(new EmployeeSchedule { EmployeeId = employeeId, DayOfWeek = s.DayOfWeek, StartTime = s.StartTime, EndTime = s.EndTime, BreakStart = s.BreakStart, BreakEnd = s.BreakEnd, IsAvailable = s.IsAvailable, MaxAppointments = s.MaxAppointments, Notes = s.Notes, CreatedAt = DateTimeOffset.UtcNow });
        }
        await _context.SaveChangesAsync();
    }

    public async Task<List<EmployeeUnavailabilityResponseDto>> GetUnavailabilityAsync(int employeeId)
    {
        return await _context.EmployeeUnavailabilities.Where(u => u.EmployeeId == employeeId).Include(u => u.Employee)
            .Select(u => new EmployeeUnavailabilityResponseDto { Id = u.Id, EmployeeId = u.EmployeeId, EmployeeName = u.Employee.FullName, UnavailabilityType = u.UnavailabilityType, StartDate = u.StartDate, EndDate = u.EndDate, StartTime = u.StartTime, EndTime = u.EndTime, Repeat = u.Repeat, Reason = u.Reason, CreatedAt = u.CreatedAt, UpdatedAt = u.UpdatedAt }).ToListAsync();
    }

    public async Task<EmployeeUnavailabilityResponseDto> AddUnavailabilityAsync(EmployeeUnavailabilityCreateDto dto, int userId)
    {
        var employee = await _repository.GetByIdAsync(dto.EmployeeId) ?? throw new KeyNotFoundException("Employee not found");
        var unavailability = new EmployeeUnavailability { EmployeeId = dto.EmployeeId, UnavailabilityType = dto.UnavailabilityType, StartDate = dto.StartDate, EndDate = dto.EndDate, StartTime = dto.StartTime, EndTime = dto.EndTime, Repeat = string.IsNullOrWhiteSpace(dto.Repeat) ? "None" : dto.Repeat, Reason = dto.Reason, CreatedBy = userId, CreatedAt = DateTimeOffset.UtcNow };
        _context.EmployeeUnavailabilities.Add(unavailability);
        await _context.SaveChangesAsync();

        await _context.Entry(unavailability).Reference(u => u.Employee).LoadAsync();

        return new EmployeeUnavailabilityResponseDto { Id = unavailability.Id, EmployeeId = dto.EmployeeId, EmployeeName = employee.FullName, UnavailabilityType = dto.UnavailabilityType, StartDate = dto.StartDate, EndDate = dto.EndDate, StartTime = dto.StartTime, EndTime = dto.EndTime, Repeat = unavailability.Repeat, Reason = dto.Reason, CreatedAt = unavailability.CreatedAt, UpdatedAt = unavailability.UpdatedAt };
    }

    public async Task RemoveUnavailabilityAsync(int unavailabilityId)
    {
        var unavailability = await _context.EmployeeUnavailabilities.FindAsync(unavailabilityId) ?? throw new KeyNotFoundException("Unavailability not found");
        _context.EmployeeUnavailabilities.Remove(unavailability);
        await _context.SaveChangesAsync();
    }

    public async Task<IReadOnlyList<EmployeeResponseDto>> GetAvailableAsync(DateOnly date)
    {
        var allEmployees = await _context.Employees
            .Include(e => e.Department)
            .Where(e => e.Status == "Active")
            .ToListAsync();

        var unavailableEmployeeIds = await _context.EmployeeUnavailabilities
            .Where(u => u.StartDate <= date && (u.EndDate == null || u.EndDate >= date))
            .Select(u => u.EmployeeId)
            .ToListAsync();

        return allEmployees
            .Where(e => !unavailableEmployeeIds.Contains(e.Id))
            .Select(MapToDto)
            .ToList();
    }

    public async Task<IReadOnlyList<EmployeeResponseDto>> GetAvailableEmployeesAsync() => (await _repository.GetAvailableEmployeesAsync()).Select(MapToDto).ToList();
    public async Task<IReadOnlyList<EmployeeResponseDto>> SearchAsync(string query) => (await _repository.SearchAsync(query)).Select(MapToDto).ToList();

    private static EmployeeResponseDto MapToDto(Employee e) => new()
    {
        Id = e.Id, FullName = e.FullName, Phone = e.Phone, Email = e.Email, DepartmentId = e.DepartmentId,
        DepartmentName = e.Department?.Name ?? "", Position = e.Position, OfficeNumber = e.OfficeNumber,
        Status = e.Status, UserId = e.UserId, CreatedAt = e.CreatedAt
    };
}
