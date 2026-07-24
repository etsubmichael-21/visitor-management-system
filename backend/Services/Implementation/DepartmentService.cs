using EcxVisitorManagement.DTOs.Common;
using EcxVisitorManagement.DTOs.Departments;
using EcxVisitorManagement.Interfaces;
using EcxVisitorManagement.Models;

namespace EcxVisitorManagement.Services.Implementation;

public class DepartmentService : IDepartmentService
{
    private readonly IDepartmentRepository _repository;
    public DepartmentService(IDepartmentRepository repository) => _repository = repository;

    public async Task<PagedResponse<DepartmentResponseDto>> GetAllAsync(PageRequest request)
    {
        var paged = await _repository.GetPagedAsync(request);
        return new PagedResponse<DepartmentResponseDto> { Items = paged.Items.Select(MapToDto).ToList(), TotalCount = paged.TotalCount, Page = paged.Page, PageSize = paged.PageSize };
    }

    public async Task<DepartmentResponseDto?> GetByIdAsync(int id) { var d = await _repository.GetByIdAsync(id); return d == null ? null : MapToDto(d); }

    public async Task<DepartmentResponseDto> CreateAsync(DepartmentCreateDto dto)
    {
        var dept = new Department { Name = dto.Name, Description = dto.Description, Location = dto.Location, Phone = dto.Phone, Email = dto.Email, IsActive = true, CreatedAt = DateTimeOffset.UtcNow };
        var created = await _repository.AddAsync(dept);
        return MapToDto(created);
    }

    public async Task<DepartmentResponseDto> UpdateAsync(int id, DepartmentUpdateDto dto)
    {
        var dept = await _repository.GetByIdAsync(id) ?? throw new KeyNotFoundException("Department not found");
        if (dto.Name != null) dept.Name = dto.Name;
        if (dto.Description != null) dept.Description = dto.Description;
        if (dto.Location != null) dept.Location = dto.Location;
        if (dto.Phone != null) dept.Phone = dto.Phone;
        if (dto.Email != null) dept.Email = dto.Email;
        if (dto.IsActive.HasValue) dept.IsActive = dto.IsActive.Value;
        dept.UpdatedAt = DateTimeOffset.UtcNow;
        await _repository.UpdateAsync(dept);
        return MapToDto(dept);
    }

    public async Task DeleteAsync(int id) { var d = await _repository.GetByIdAsync(id) ?? throw new KeyNotFoundException("Department not found"); await _repository.DeleteAsync(d); }

    public async Task<DepartmentStatsDto> GetStatsAsync(int departmentId)
    {
        var dept = await _repository.GetByIdAsync(departmentId) ?? throw new KeyNotFoundException("Department not found");
        return new DepartmentStatsDto { DepartmentId = dept.Id, DepartmentName = dept.Name, TotalEmployees = dept.Employees?.Count ?? 0, ActiveEmployees = dept.Employees?.Count(e => e.Status == "Active") ?? 0 };
    }

    public async Task<IReadOnlyList<DepartmentResponseDto>> GetActiveDepartmentsAsync() => (await _repository.GetActiveDepartmentsAsync()).Select(MapToDto).ToList();

    private static DepartmentResponseDto MapToDto(Department d) => new()
    {
        Id = d.Id, Name = d.Name, Description = d.Description, Location = d.Location, Phone = d.Phone,
        Email = d.Email, IsActive = d.IsActive, EmployeeCount = d.Employees?.Count ?? 0, CreatedAt = d.CreatedAt,
        UpdatedAt = d.UpdatedAt
    };
}
