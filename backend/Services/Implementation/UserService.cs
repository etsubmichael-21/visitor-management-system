using EcxVisitorManagement.DTOs.Common;
using EcxVisitorManagement.DTOs.Users;
using EcxVisitorManagement.Interfaces;
using EcxVisitorManagement.Models;

namespace EcxVisitorManagement.Services.Implementation;

public class UserService : IUserService
{
    private readonly IGenericRepository<User> _repository;
    public UserService(IGenericRepository<User> repository) => _repository = repository;

    public async Task<PagedResponse<UserResponseDto>> GetAllAsync(PageRequest request)
    {
        var paged = await _repository.GetPagedAsync(request);
        return new PagedResponse<UserResponseDto> { Items = paged.Items.Select(MapToDto).ToList(), TotalCount = paged.TotalCount, Page = paged.Page, PageSize = paged.PageSize };
    }

    public async Task<UserResponseDto?> GetByIdAsync(int id) { var u = await _repository.GetByIdAsync(id); return u == null ? null : MapToDto(u); }

    public async Task<UserResponseDto> CreateAsync(UserCreateDto dto)
    {
        if (await _repository.ExistsAsync(u => u.Email == dto.Email)) throw new InvalidOperationException("Email already exists");
        var user = new User { FullName = dto.FullName, Email = dto.Email, PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password), Role = dto.Role, IsActive = true, EmployeeId = dto.EmployeeId, CreatedAt = DateTimeOffset.UtcNow };
        var created = await _repository.AddAsync(user);
        return MapToDto(created);
    }

    public async Task<UserResponseDto> UpdateAsync(int id, UserUpdateDto dto)
    {
        var user = await _repository.GetByIdAsync(id) ?? throw new KeyNotFoundException("User not found");
        if (dto.FullName != null) user.FullName = dto.FullName;
        if (dto.Email != null) user.Email = dto.Email;
        if (dto.Role != null) user.Role = dto.Role;
        if (dto.IsActive.HasValue) user.IsActive = dto.IsActive.Value;
        user.UpdatedAt = DateTimeOffset.UtcNow;
        await _repository.UpdateAsync(user);
        return MapToDto(user);
    }

    public async Task DeleteAsync(int id) { var u = await _repository.GetByIdAsync(id) ?? throw new KeyNotFoundException("User not found"); await _repository.DeleteAsync(u); }
    public async Task<UserResponseDto> ActivateAsync(int id) { var u = await _repository.GetByIdAsync(id) ?? throw new KeyNotFoundException("User not found"); u.IsActive = true; u.UpdatedAt = DateTimeOffset.UtcNow; await _repository.UpdateAsync(u); return MapToDto(u); }
    public async Task<UserResponseDto> DeactivateAsync(int id) { var u = await _repository.GetByIdAsync(id) ?? throw new KeyNotFoundException("User not found"); u.IsActive = false; u.UpdatedAt = DateTimeOffset.UtcNow; await _repository.UpdateAsync(u); return MapToDto(u); }

    public async Task ResetPasswordAsync(int id, string newPassword)
    {
        var user = await _repository.GetByIdAsync(id) ?? throw new KeyNotFoundException("User not found");
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        user.UpdatedAt = DateTimeOffset.UtcNow;
        await _repository.UpdateAsync(user);
    }

    private static UserResponseDto MapToDto(User u) => new()
    {
        Id = u.Id, FullName = u.FullName, Email = u.Email, Role = u.Role, IsActive = u.IsActive,
        EmployeeId = u.EmployeeId, EmployeeName = u.Employee?.FullName, VisitorId = u.VisitorId,
        VisitorName = u.Visitor?.FullName, LastLogin = u.LastLogin, CreatedAt = u.CreatedAt
    };
}
