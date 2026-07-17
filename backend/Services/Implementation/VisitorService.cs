using EcxVisitorManagement.DTOs.Common;
using EcxVisitorManagement.DTOs.Visitors;
using EcxVisitorManagement.Interfaces;
using EcxVisitorManagement.Models;

namespace EcxVisitorManagement.Services.Implementation;

public class VisitorService : IVisitorService
{
    private readonly IVisitorRepository _repository;
    public VisitorService(IVisitorRepository repository) => _repository = repository;

    public async Task<PagedResponse<VisitorResponseDto>> GetAllAsync(PageRequest request)
    {
        var paged = await _repository.GetPagedAsync(request);
        return new PagedResponse<VisitorResponseDto> { Items = paged.Items.Select(MapToDto).ToList(), TotalCount = paged.TotalCount, Page = paged.Page, PageSize = paged.PageSize };
    }

    public async Task<VisitorResponseDto?> GetByIdAsync(int id) { var v = await _repository.GetByIdAsync(id); return v == null ? null : MapToDto(v); }
    public async Task<VisitorResponseDto?> GetByEmailAsync(string email) { var v = await _repository.GetByEmailAsync(email); return v == null ? null : MapToDto(v); }

    public async Task<VisitorResponseDto> CreateAsync(VisitorCreateDto dto)
    {
        if (await _repository.ExistsAsync(v => v.Email == dto.Email)) throw new InvalidOperationException("Email already registered");
        var visitor = new Visitor { FullName = dto.FullName, Phone = dto.Phone, Email = dto.Email, Address = dto.Address, NationalId = dto.NationalId, Organization = dto.Organization, Gender = dto.Gender, IsActive = true, CreatedAt = DateTimeOffset.UtcNow };
        var created = await _repository.AddAsync(visitor);
        return MapToDto(created);
    }

    public async Task<VisitorResponseDto> UpdateAsync(int id, VisitorUpdateDto dto)
    {
        var visitor = await _repository.GetByIdAsync(id) ?? throw new KeyNotFoundException("Visitor not found");
        if (dto.FullName != null) visitor.FullName = dto.FullName;
        if (dto.Phone != null) visitor.Phone = dto.Phone;
        if (dto.Address != null) visitor.Address = dto.Address;
        if (dto.Organization != null) visitor.Organization = dto.Organization;
        if (dto.Gender != null) visitor.Gender = dto.Gender;
        visitor.UpdatedAt = DateTimeOffset.UtcNow;
        await _repository.UpdateAsync(visitor);
        return MapToDto(visitor);
    }

    public async Task DeleteAsync(int id)
    {
        var visitor = await _repository.GetByIdAsync(id) ?? throw new KeyNotFoundException("Visitor not found");
        visitor.IsActive = false;
        visitor.UpdatedAt = DateTimeOffset.UtcNow;
        await _repository.UpdateAsync(visitor);
    }

    public async Task<string> UploadPhotoAsync(int id, string photoUrl)
    {
        var visitor = await _repository.GetByIdAsync(id) ?? throw new KeyNotFoundException("Visitor not found");
        visitor.PhotoUrl = photoUrl;
        visitor.UpdatedAt = DateTimeOffset.UtcNow;
        await _repository.UpdateAsync(visitor);
        return photoUrl;
    }

    public async Task<IReadOnlyList<VisitorResponseDto>> SearchAsync(string query) => (await _repository.SearchAsync(query)).Select(MapToDto).ToList();

    private static VisitorResponseDto MapToDto(Visitor v) => new()
    {
        Id = v.Id, FullName = v.FullName, Phone = v.Phone, Email = v.Email, Address = v.Address,
        NationalId = v.NationalId, Organization = v.Organization, Gender = v.Gender, PhotoUrl = v.PhotoUrl,
        IsActive = v.IsActive, TotalVisits = v.Visits?.Count ?? 0, TotalAppointments = v.Appointments?.Count ?? 0,
        CreatedAt = v.CreatedAt
    };
}
