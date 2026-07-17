using EcxVisitorManagement.DTOs.Common;
using EcxVisitorManagement.DTOs.Users;

namespace EcxVisitorManagement.Interfaces;

public interface IUserService
{
    Task<PagedResponse<UserResponseDto>> GetAllAsync(PageRequest request);
    Task<UserResponseDto?> GetByIdAsync(int id);
    Task<UserResponseDto> CreateAsync(UserCreateDto dto);
    Task<UserResponseDto> UpdateAsync(int id, UserUpdateDto dto);
    Task DeleteAsync(int id);
    Task<UserResponseDto> ActivateAsync(int id);
    Task<UserResponseDto> DeactivateAsync(int id);
    Task ResetPasswordAsync(int id, string newPassword);
}
