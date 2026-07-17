using EcxVisitorManagement.DTOs.Common;
using EcxVisitorManagement.DTOs.Visits;

namespace EcxVisitorManagement.Interfaces;

public interface IVisitService
{
    Task<PagedResponse<VisitResponseDto>> GetAllAsync(PageRequest request);
    Task<VisitResponseDto?> GetByIdAsync(int id);
    Task<VisitResponseDto> CreateAsync(VisitCreateDto dto);
    Task<VisitResponseDto> CheckInAsync(CheckInRequest request);
    Task<VisitResponseDto> CheckOutAsync(int id, CheckOutRequest request);
    Task<VisitResponseDto> CancelAsync(int id);
    Task<IReadOnlyList<VisitResponseDto>> GetByVisitorAsync(int visitorId);
    Task<IReadOnlyList<VisitResponseDto>> GetByEmployeeAsync(int employeeId);
    Task<IReadOnlyList<VisitResponseDto>> GetTodayVisitsAsync();
    Task<IReadOnlyList<VisitResponseDto>> GetActiveVisitsAsync();
    Task<List<VisitorItemDto>> GetItemsAsync(int visitId);
    Task<VisitorItemDto> AddItemAsync(int visitId, VisitorItemCreateDto dto);
    Task<IReadOnlyList<VisitorItemDto>> AddItemsAsync(int visitId, List<VisitorItemCreateDto> items);
    Task<List<VisitorItemDto>> VerifyItemsAsync(int visitId, List<ItemVerificationDto> items);
}
