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
    private readonly ILogger<VisitService> _logger;

    public VisitService(IVisitRepository repository, AppDbContext context, ILogger<VisitService> logger)
    {
        _repository = repository;
        _context = context;
        _logger = logger;
    }

    public async Task<PagedResponse<VisitResponseDto>> GetAllAsync(PageRequest request)
    {
        var paged = await _repository.GetPagedAsync(request);
        _logger.LogInformation("[Visits:GetAll] Status={Status} DateFrom={DateFrom} DateTo={DateTo} IsActive={IsActive} Search={Search} => TotalCount={TotalCount}",
            request.Status, request.DateFrom, request.DateTo, request.IsActive, request.Search, paged.TotalCount);
        return new PagedResponse<VisitResponseDto> { Items = paged.Items.Select(MapToDto).ToList(), TotalCount = paged.TotalCount, Page = paged.Page, PageSize = paged.PageSize };
    }

    public async Task<PagedResponse<VisitResponseDto>> ReceptionTodayAsync(PageRequest request)
    {
        var today = DateOnly.FromDateTime(DateTime.Now);
        _logger.LogInformation("[Visits:ReceptionToday] ServerLocalDate={Today}", today);

        var todayAppointments = await _context.Appointments
            .Include(a => a.Visitor)
            .Include(a => a.Employee).ThenInclude(e => e.Department)
            .Where(a => a.RequestedDate == today)
            .ToListAsync();

        var visits = await _context.Visits
            .Include(v => v.Visitor)
            .Include(v => v.Employee).ThenInclude(e => e.Department)
            .Where(v => v.VisitDate == today)
            .ToListAsync();

        var combined = new List<(DateTimeOffset SortKey, VisitResponseDto Dto)>();
        foreach (var a in todayAppointments)
            combined.Add((a.RequestedStartTime, MapAppointmentToVisitDto(a)));
        foreach (var v in visits)
        {
            var dto = MapToDto(v);
            if (dto.Status == "Scheduled") dto.Status = "Expected";
            combined.Add((v.CheckInTime ?? v.CreatedAt, dto));
        }

        var items = combined.OrderBy(x => x.SortKey).Select(x => x.Dto).ToList();

        if (!string.IsNullOrWhiteSpace(request.Search))
            items = items.Where(x =>
                x.VisitorName.Contains(request.Search, StringComparison.OrdinalIgnoreCase)
                || x.EmployeeName.Contains(request.Search, StringComparison.OrdinalIgnoreCase)
                || x.Purpose.Contains(request.Search, StringComparison.OrdinalIgnoreCase)).ToList();

        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            var statuses = request.Status.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            items = items.Where(x => statuses.Contains(x.Status)).ToList();
        }

        var totalCount = items.Count;
        _logger.LogInformation("[Visits:ReceptionToday] Status={Status} Search={Search} AppointmentsToday={AppointmentCount} Visits={VisitCount} => TotalCount={TotalCount}",
            request.Status, request.Search, todayAppointments.Count, visits.Count, totalCount);

        var pagedItems = items.Skip((request.Page - 1) * request.PageSize).Take(request.PageSize).ToList();
        return new PagedResponse<VisitResponseDto> { Items = pagedItems, TotalCount = totalCount, Page = request.Page, PageSize = request.PageSize };
    }

    public async Task<VisitResponseDto?> GetByIdAsync(int id) { var v = await _repository.GetByIdAsync(id); return v == null ? null : MapToDto(v); }

    public async Task<VisitResponseDto> CreateAsync(VisitCreateDto dto)
    {
        var visit = new Visit { VisitorId = dto.VisitorId, EmployeeId = dto.EmployeeId, AppointmentId = dto.AppointmentId, Purpose = dto.Purpose, IsDestinationKnown = dto.IsDestinationKnown, Remark = dto.Remark, VisitDate = DateOnly.FromDateTime(DateTime.Now), Status = "Scheduled", CreatedAt = DateTimeOffset.UtcNow };
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
            VisitDate = DateOnly.FromDateTime(DateTime.Now),
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

    private static VisitResponseDto MapAppointmentToVisitDto(Appointment a) => new()
    {
        Id = a.Id, VisitorId = a.VisitorId, VisitorName = a.Visitor?.FullName ?? "", VisitorPhone = a.Visitor?.Phone ?? "",
        VisitorEmail = a.Visitor?.Email ?? "", EmployeeId = a.EmployeeId,
        EmployeeName = a.Employee?.FullName ?? "", DepartmentName = a.Employee?.Department?.Name ?? "",
        AppointmentId = a.Id, Purpose = a.Purpose, VisitDate = a.RequestedDate,
        Status = a.Status is "Pending" or "Approved" or "Rescheduled" or "Delegated" ? "Expected" : a.Status,
        IsDestinationKnown = true, CreatedAt = a.CreatedAt
    };

    private static VisitorItemDto MapItemToDto(VisitorItem i) => new()
    {
        Id = i.Id, ItemName = i.ItemName, Quantity = i.Quantity, SerialNumber = i.SerialNumber,
        Brand = i.Brand, Description = i.Description, IsVerified = i.IsVerified, VerifiedAt = i.VerifiedAt
    };
}
