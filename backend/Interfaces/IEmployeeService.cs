using EcxVisitorManagement.DTOs.Common;
using EcxVisitorManagement.DTOs.Employees;

namespace EcxVisitorManagement.Interfaces;

public interface IEmployeeService
{
    Task<PagedResponse<EmployeeResponseDto>> GetAllAsync(PageRequest request);
    Task<EmployeeResponseDto?> GetByIdAsync(int id);
    Task<EmployeeResponseDto> CreateAsync(EmployeeCreateDto dto);
    Task<EmployeeResponseDto> UpdateAsync(int id, EmployeeUpdateDto dto);
    Task DeleteAsync(int id);
    Task<List<EmployeeScheduleDto>> GetScheduleAsync(int employeeId);
    Task UpdateScheduleAsync(int employeeId, EmployeeScheduleUpdateDto dto);
    Task<List<EmployeeUnavailabilityResponseDto>> GetUnavailabilityAsync(int employeeId);
    Task<EmployeeUnavailabilityResponseDto> AddUnavailabilityAsync(EmployeeUnavailabilityCreateDto dto, int userId);
    Task RemoveUnavailabilityAsync(int unavailabilityId);
    Task<IReadOnlyList<EmployeeResponseDto>> GetAvailableAsync(DateOnly date);
    Task<IReadOnlyList<EmployeeResponseDto>> GetAvailableEmployeesAsync();
    Task<IReadOnlyList<EmployeeResponseDto>> SearchAsync(string query);
}
