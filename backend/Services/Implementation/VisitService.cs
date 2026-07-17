using Microsoft.EntityFrameworkCore;
using EcxVisitorManagement.Data;
using EcxVisitorManagement.DTOs.Common;
using EcxVisitorManagement.DTOs.Visits;
using EcxVisitorManagement.Interfaces;
using EcxVisitorManagement.Models;

namespace EcxVisitorManagement.Services.Implementation;

public class VisitService : IVisitService
{
    private readonly IVisitRepository _repository;
    private readonly AppDbContext _context;

    public VisitService(IVisitRepository repository, AppDbContext context)
    {
        _repository = repository;
        _context = context;
    }

    public async Task<PagedResponse<VisitResponseDto>> GetAllAsync(PageRequest request)
    {
        var paged = await _repository.GetPagedAsync(request);
        return new PagedResponse<VisitResponseDto> { Items = paged.Items.Select(MapToDto).ToList(), TotalCount = paged.TotalCount, Page = paged.Page, PageSize = paged.PageSize };
    }

    public async Task<VisitResponseDto?> GetByIdAsync(int id) { var v = await _repository.GetByIdAsync(id); return v == null ? null : MapToDto(v); }

    public async Task<VisitResponseDto> CreateAsync(VisitCreateDto dto)
    {
        var visit = new Visit { VisitorId = dto.VisitorId, EmployeeId = dto.EmployeeId, AppointmentId = dto.AppointmentId, Purpose = dto.Purpose, IsDestinationKnown = dto.IsDestinationKnown, Remark = dto.Remark, VisitDate = DateOnly.FromDateTime(DateTime.UtcNow), Status = "Scheduled", CreatedAt = DateTimeOffset.UtcNow };
        var created = await _repository.AddAsync(visit);
        return MapToDto(created);
    }

    public async Task<VisitResponseDto> CheckInAsync(CheckInRequest request)
    {
        var visit = new Visit
        {
            VisitorId = request.VisitorId,
            EmployeeId = request.EmployeeId,
            AppointmentId = request.AppointmentId,
            Purpose = request.Purpose,
            IsDestinationKnown = request.IsDestinationKnown,
            BadgeNumber = request.BadgeNumber ?? $"B-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..4].ToUpper()}",
            SecurityOfficer = request.SecurityOfficer,
            Status = "CheckedIn",
            CheckInTime = DateTimeOffset.UtcNow,
            VisitDate = DateOnly.FromDateTime(DateTime.UtcNow),
            CreatedAt = DateTimeOffset.UtcNow
        };
        var created = await _repository.AddAsync(visit);
        return MapToDto(created);
    }

    public async Task<VisitResponseDto> CheckOutAsync(int id, CheckOutRequest request)
    {
        var visit = await _repository.GetByIdAsync(id) ?? throw new KeyNotFoundException("Visit not found");
        if (visit.Status != "CheckedIn") throw new InvalidOperationException("Only checked-in visitors can be checked out");
        var visitWithItems = await _repository.GetWithItemsAsync(id);
        if (visitWithItems?.VisitorItems?.Any() == true && visitWithItems.VisitorItems.Any(i => !i.IsVerified))
            throw new InvalidOperationException("All visitor items must be verified before checkout");
        visit.Status = "CheckedOut";
        visit.CheckOutTime = DateTimeOffset.UtcNow;
        visit.SecurityOfficer = request.SecurityOfficer;
        visit.Remark = request.Remark;
        visit.UpdatedAt = DateTimeOffset.UtcNow;
        await _repository.UpdateAsync(visit);
        return MapToDto(visit);
    }

    public async Task<VisitResponseDto> CancelAsync(int id)
    {
        var visit = await _repository.GetByIdAsync(id) ?? throw new KeyNotFoundException("Visit not found");
        if (visit.Status is "CheckedOut" or "Cancelled") throw new InvalidOperationException("Cannot cancel this visit");
        visit.Status = "Cancelled";
        visit.UpdatedAt = DateTimeOffset.UtcNow;
        await _repository.UpdateAsync(visit);
        return MapToDto(visit);
    }

    public async Task<IReadOnlyList<VisitResponseDto>> GetByVisitorAsync(int visitorId) => (await _repository.GetByVisitorIdAsync(visitorId)).Select(MapToDto).ToList();
    public async Task<IReadOnlyList<VisitResponseDto>> GetByEmployeeAsync(int employeeId) => (await _repository.GetByEmployeeIdAsync(employeeId)).Select(MapToDto).ToList();
    public async Task<IReadOnlyList<VisitResponseDto>> GetTodayVisitsAsync() => (await _repository.GetTodayVisitsAsync()).Select(MapToDto).ToList();
    public async Task<IReadOnlyList<VisitResponseDto>> GetActiveVisitsAsync() => (await _repository.GetActiveVisitsAsync()).Select(MapToDto).ToList();

    public async Task<List<VisitorItemDto>> GetItemsAsync(int visitId)
    {
        var visit = await _repository.GetWithItemsAsync(visitId) ?? throw new KeyNotFoundException("Visit not found");
        return visit.VisitorItems.Select(MapItemToDto).ToList();
    }

    public async Task<VisitorItemDto> AddItemAsync(int visitId, VisitorItemCreateDto dto)
    {
        _ = await _repository.GetByIdAsync(visitId) ?? throw new KeyNotFoundException("Visit not found");
        var item = new VisitorItem { VisitId = visitId, ItemName = dto.ItemName, Quantity = dto.Quantity, SerialNumber = dto.SerialNumber, Brand = dto.Brand, Description = dto.Description, CreatedAt = DateTimeOffset.UtcNow };
        _context.VisitorItems.Add(item);
        await _context.SaveChangesAsync();
        return MapItemToDto(item);
    }

    public async Task<IReadOnlyList<VisitorItemDto>> AddItemsAsync(int visitId, List<VisitorItemCreateDto> items)
    {
        _ = await _repository.GetByIdAsync(visitId) ?? throw new KeyNotFoundException("Visit not found");
        var addedItems = new List<VisitorItem>();
        foreach (var dto in items)
        {
            var item = new VisitorItem { VisitId = visitId, ItemName = dto.ItemName, Quantity = dto.Quantity, SerialNumber = dto.SerialNumber, Brand = dto.Brand, Description = dto.Description, CreatedAt = DateTimeOffset.UtcNow };
            _context.VisitorItems.Add(item);
            addedItems.Add(item);
        }
        await _context.SaveChangesAsync();
        return addedItems.Select(MapItemToDto).ToList();
    }

    public async Task<List<VisitorItemDto>> VerifyItemsAsync(int visitId, List<ItemVerificationDto> items)
    {
        var visit = await _repository.GetWithItemsAsync(visitId) ?? throw new KeyNotFoundException("Visit not found");
        foreach (var itemUpdate in items)
        {
            var item = visit.VisitorItems.FirstOrDefault(i => i.Id == itemUpdate.ItemId);
            if (item != null) { item.IsVerified = itemUpdate.IsVerified; item.VerifiedAt = DateTimeOffset.UtcNow; }
        }
        await _context.SaveChangesAsync();
        return visit.VisitorItems.Select(MapItemToDto).ToList();
    }

    private static VisitResponseDto MapToDto(Visit v) => new()
    {
        Id = v.Id, VisitorId = v.VisitorId, VisitorName = v.Visitor?.FullName ?? "", VisitorPhone = v.Visitor?.Phone ?? "",
        VisitorEmail = v.Visitor?.Email ?? "", VisitorPhotoUrl = v.Visitor?.PhotoUrl, EmployeeId = v.EmployeeId,
        EmployeeName = v.Employee?.FullName ?? "", DepartmentName = v.Employee?.Department?.Name ?? "",
        AppointmentId = v.AppointmentId, Purpose = v.Purpose, VisitDate = v.VisitDate, CheckInTime = v.CheckInTime,
        CheckOutTime = v.CheckOutTime, Status = v.Status, BadgeNumber = v.BadgeNumber, SecurityOfficer = v.SecurityOfficer,
        Remark = v.Remark, IsDestinationKnown = v.IsDestinationKnown, RedirectNote = v.RedirectNote,
        VisitorItems = v.VisitorItems?.Select(MapItemToDto).ToList() ?? new(),
        AllItemsVerified = v.VisitorItems?.Any() == true && v.VisitorItems.All(i => i.IsVerified),
        CreatedAt = v.CreatedAt
    };

    private static VisitorItemDto MapItemToDto(VisitorItem i) => new()
    {
        Id = i.Id, ItemName = i.ItemName, Quantity = i.Quantity, SerialNumber = i.SerialNumber,
        Brand = i.Brand, Description = i.Description, IsVerified = i.IsVerified, VerifiedAt = i.VerifiedAt
    };
}
