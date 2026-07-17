using EcxVisitorManagement.DTOs.Common;
using EcxVisitorManagement.DTOs.Visitors;

namespace EcxVisitorManagement.Interfaces;

public interface IVisitorService
{
    Task<PagedResponse<VisitorResponseDto>> GetAllAsync(PageRequest request);
    Task<VisitorResponseDto?> GetByIdAsync(int id);
    Task<VisitorResponseDto> CreateAsync(VisitorCreateDto dto);
    Task<VisitorResponseDto> UpdateAsync(int id, VisitorUpdateDto dto);
    Task DeleteAsync(int id);
    Task<string> UploadPhotoAsync(int id, string photoUrl);
    Task<IReadOnlyList<VisitorResponseDto>> SearchAsync(string query);
    Task<VisitorResponseDto?> GetByEmailAsync(string email);
}
