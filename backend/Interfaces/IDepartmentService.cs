using EcxVisitorManagement.DTOs.Common;
using EcxVisitorManagement.DTOs.Departments;

namespace EcxVisitorManagement.Interfaces;

public interface IDepartmentService
{
    Task<PagedResponse<DepartmentResponseDto>> GetAllAsync(PageRequest request);
    Task<DepartmentResponseDto?> GetByIdAsync(int id);
    Task<DepartmentResponseDto> CreateAsync(DepartmentCreateDto dto);
    Task<DepartmentResponseDto> UpdateAsync(int id, DepartmentUpdateDto dto);
    Task DeleteAsync(int id);
    Task<DepartmentStatsDto> GetStatsAsync(int departmentId);
    Task<IReadOnlyList<DepartmentResponseDto>> GetActiveDepartmentsAsync();
}
