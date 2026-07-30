using Microsoft.EntityFrameworkCore;
using EcxVisitorManagement.Data;
using EcxVisitorManagement.DTOs.Appointments;
using EcxVisitorManagement.DTOs.Common;
using EcxVisitorManagement.Interfaces;
using EcxVisitorManagement.Models;

namespace EcxVisitorManagement.Services.Implementation;

public class AppointmentService : IAppointmentService
{
    private readonly IAppointmentRepository _repository;
    private readonly INotificationRepository _notificationRepository;
    private readonly IVisitorNotificationRepository _visitorNotificationRepository;
    private readonly IVisitorRepository _visitorRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IEmailService _emailService;
    private readonly ISmsService _smsService;
    private readonly AppDbContext _context;

    public AppointmentService(
        IAppointmentRepository repository,
        INotificationRepository notificationRepository,
        IVisitorNotificationRepository visitorNotificationRepository,
        IVisitorRepository visitorRepository,
        IEmployeeRepository employeeRepository,
        IEmailService emailService,
        ISmsService smsService,
        AppDbContext context)
    {
        _repository = repository;
        _notificationRepository = notificationRepository;
        _visitorNotificationRepository = visitorNotificationRepository;
        _visitorRepository = visitorRepository;
        _employeeRepository = employeeRepository;
        _emailService = emailService;
        _smsService = smsService;
        _context = context;
    }

    public async Task<PagedResponse<AppointmentResponseDto>> GetAllAsync(PageRequest request)
    {
        var paged = await _repository.GetPagedAsync(request);
        return new PagedResponse<AppointmentResponseDto>
        {
            Items = paged.Items.Select(MapToDto).ToList(),
            TotalCount = paged.TotalCount,
            Page = paged.Page,
            PageSize = paged.PageSize
        };
    }

    public async Task<PagedResponse<AppointmentResponseDto>> GetAllByEmployeeAsync(int employeeId, PageRequest request)
    {
        var paged = await _repository.GetPagedByEmployeeIdAsync(employeeId, request);
        return new PagedResponse<AppointmentResponseDto>
        {
            Items = paged.Items.Select(MapToDto).ToList(),
            TotalCount = paged.TotalCount,
            Page = paged.Page,
            PageSize = paged.PageSize
        };
    }

    public async Task<PagedResponse<AppointmentResponseDto>> GetAllByVisitorAsync(int visitorId, PageRequest request)
    {
        var paged = await _repository.GetPagedByVisitorIdAsync(visitorId, request);
        return new PagedResponse<AppointmentResponseDto>
        {
            Items = paged.Items.Select(MapToDto).ToList(),
            TotalCount = paged.TotalCount,
            Page = paged.Page,
            PageSize = paged.PageSize
        };
    }

    public async Task<AppointmentResponseDto?> GetByIdAsync(int id)
    {
        var appointment = await _repository.GetByIdAsync(id);
        return appointment == null ? null : MapToDto(appointment);
    }

    public async Task<AppointmentResponseDto> CreateAsync(AppointmentCreateDto dto)
    {
        var appointment = new Appointment
        {
            VisitorId = dto.VisitorId,
            EmployeeId = dto.EmployeeId,
            RequestedDate = dto.RequestedDate,
            RequestedStartTime = dto.RequestedStartTime,
            RequestedEndTime = dto.RequestedEndTime,
            Purpose = dto.Purpose,
            IsConfidential = dto.IsConfidential,
            Notes = dto.Notes,
            Status = "Pending",
            AppointmentCode = GenerateCode(),
            CreatedAt = DateTimeOffset.UtcNow
        };
        var created = await _repository.AddAsync(appointment);

        var visitor = await _visitorRepository.GetByIdAsync(dto.VisitorId);
        var employee = await _employeeRepository.GetByIdAsync(dto.EmployeeId);

        if (visitor != null)
        {
            await _visitorNotificationRepository.AddAsync(new VisitorNotification
            {
                VisitorId = dto.VisitorId,
                AppointmentId = created.Id,
                Title = "Appointment Request Received",
                Message = $"Your appointment request with {employee?.FullName ?? "Employee"} on {dto.RequestedDate} has been received and is under review. You will be notified once it is approved or rejected.",
                NotificationType = "Info",
                Channel = "InApp",
                CreatedAt = DateTimeOffset.UtcNow
            });

            if (!string.IsNullOrEmpty(visitor.Email))
                await _emailService.SendAppointmentSubmittedAsync(
                    visitor.Email, visitor.FullName, employee?.FullName ?? "",
                    employee?.Department?.Name ?? "", dto.RequestedDate,
                    dto.RequestedStartTime, dto.RequestedEndTime,
                    dto.Purpose, dto.Notes);
            if (!string.IsNullOrEmpty(visitor.Phone))
                await _smsService.SendAppointmentNotificationAsync(visitor.Phone, visitor.FullName, employee?.FullName ?? "", dto.RequestedDate, "Submitted");
        }

        if (employee != null && !string.IsNullOrEmpty(employee.Email))
        {
            await _notificationRepository.AddAsync(new Notification
            {
                EmployeeId = dto.EmployeeId,
                AppointmentId = created.Id,
                Title = "New Appointment Request",
                Message = $"You have a new appointment request from {visitor?.FullName ?? "Visitor"} on {dto.RequestedDate}.",
                NotificationType = "Info",
                Priority = "Normal",
                Channel = "InApp",
                CreatedAt = DateTimeOffset.UtcNow
            });

            await _emailService.SendEmployeeNewRequestAsync(
                employee.Email, employee.FullName, visitor?.FullName ?? "",
                employee.Department?.Name ?? "", dto.RequestedDate,
                dto.RequestedStartTime, dto.RequestedEndTime,
                dto.Purpose, dto.Notes);
        }

        return MapToDto(created);
    }

    public async Task<AppointmentResponseDto> ApproveAsync(int id, int userId)
    {
        var appointment = await LoadWithDetailsAsync(id);
        if (appointment.Status != "Pending") throw new InvalidOperationException("Only pending appointments can be approved");

        appointment.Status = "Approved";
        appointment.CheckInAllowed = true;
        appointment.EmployeeResponse = DateTimeOffset.UtcNow;
        appointment.ApprovalDate = DateTimeOffset.UtcNow;
        appointment.UpdatedAt = DateTimeOffset.UtcNow;
        await _repository.UpdateAsync(appointment);

        await _notificationRepository.AddAsync(new Notification
        {
            EmployeeId = appointment.EmployeeId,
            AppointmentId = appointment.Id,
            Title = "Appointment Approved",
            Message = $"Appointment with {appointment.Visitor?.FullName ?? "Visitor"} on {appointment.RequestedDate} has been approved.",
            NotificationType = "Info",
            Priority = "Normal",
            Channel = "InApp",
            CreatedAt = DateTimeOffset.UtcNow
        });

        if (appointment.Visitor != null)
        {
            await _visitorNotificationRepository.AddAsync(new VisitorNotification
            {
                VisitorId = appointment.VisitorId,
                AppointmentId = appointment.Id,
                Title = "Appointment Approved",
                Message = $"Your appointment with {appointment.Employee?.FullName ?? "Employee"} on {appointment.RequestedDate} has been approved.",
                NotificationType = "Info",
                Channel = "InApp",
                CreatedAt = DateTimeOffset.UtcNow
            });

            if (!string.IsNullOrEmpty(appointment.Visitor.Email))
                await _emailService.SendAppointmentApprovedAsync(
                    appointment.Visitor.Email, appointment.Visitor.FullName,
                    appointment.Employee?.FullName ?? "",
                    appointment.Employee?.Department?.Name ?? "",
                    appointment.RequestedDate, appointment.RequestedStartTime,
                    appointment.RequestedEndTime, appointment.Purpose, appointment.Notes);
            if (!string.IsNullOrEmpty(appointment.Visitor.Phone))
                await _smsService.SendAppointmentNotificationAsync(appointment.Visitor.Phone, appointment.Visitor.FullName, appointment.Employee?.FullName ?? "", appointment.RequestedDate, "Approved");
        }

        return MapToDto(appointment);
    }

    public async Task<AppointmentResponseDto> RejectAsync(int id, AppointmentRejectDto dto, int userId)
    {
        var appointment = await LoadWithDetailsAsync(id);
        if (appointment.Status != "Pending") throw new InvalidOperationException("Only pending appointments can be rejected");

        appointment.Status = "Rejected";
        appointment.RejectionReason = dto.Reason;
        appointment.EmployeeResponse = DateTimeOffset.UtcNow;
        appointment.ApprovalDate = DateTimeOffset.UtcNow;
        appointment.UpdatedAt = DateTimeOffset.UtcNow;
        await _repository.UpdateAsync(appointment);

        await _notificationRepository.AddAsync(new Notification
        {
            EmployeeId = appointment.EmployeeId,
            AppointmentId = appointment.Id,
            Title = "Appointment Rejected",
            Message = $"Appointment with {appointment.Visitor?.FullName ?? "Visitor"} on {appointment.RequestedDate} has been rejected. Reason: {dto.Reason}",
            NotificationType = "Warning",
            Priority = "High",
            Channel = "InApp",
            CreatedAt = DateTimeOffset.UtcNow
        });

        if (appointment.Visitor != null)
        {
            await _visitorNotificationRepository.AddAsync(new VisitorNotification
            {
                VisitorId = appointment.VisitorId,
                AppointmentId = appointment.Id,
                Title = "Appointment Rejected",
                Message = $"Your appointment with {appointment.Employee?.FullName ?? "Employee"} on {appointment.RequestedDate} has been rejected. Reason: {dto.Reason}",
                NotificationType = "Warning",
                Channel = "InApp",
                CreatedAt = DateTimeOffset.UtcNow
            });

            if (!string.IsNullOrEmpty(appointment.Visitor.Email))
                await _emailService.SendAppointmentRejectedAsync(
                    appointment.Visitor.Email, appointment.Visitor.FullName,
                    appointment.Employee?.FullName ?? "",
                    appointment.Employee?.Department?.Name ?? "",
                    appointment.RequestedDate, appointment.RequestedStartTime,
                    appointment.RequestedEndTime, appointment.Purpose, dto.Reason);
            if (!string.IsNullOrEmpty(appointment.Visitor.Phone))
                await _smsService.SendAppointmentNotificationAsync(appointment.Visitor.Phone, appointment.Visitor.FullName, appointment.Employee?.FullName ?? "", appointment.RequestedDate, "Rejected", dto.Reason);
        }

        return MapToDto(appointment);
    }

    public async Task<AppointmentResponseDto> CancelAsync(int id, int userId)
    {
        var appointment = await LoadWithDetailsAsync(id);
        if (appointment.Status is "Completed" or "Cancelled")
            throw new InvalidOperationException("Cannot cancel a completed or already cancelled appointment");

        appointment.Status = "Cancelled";
        appointment.UpdatedAt = DateTimeOffset.UtcNow;
        await _repository.UpdateAsync(appointment);

        await _notificationRepository.AddAsync(new Notification
        {
            EmployeeId = appointment.EmployeeId,
            AppointmentId = appointment.Id,
            Title = "Appointment Cancelled",
            Message = $"Appointment with {appointment.Visitor?.FullName ?? "Visitor"} on {appointment.RequestedDate} has been cancelled.",
            NotificationType = "Warning",
            Priority = "Normal",
            Channel = "InApp",
            CreatedAt = DateTimeOffset.UtcNow
        });

        if (appointment.Visitor != null)
        {
            await _visitorNotificationRepository.AddAsync(new VisitorNotification
            {
                VisitorId = appointment.VisitorId,
                AppointmentId = appointment.Id,
                Title = "Appointment Cancelled",
                Message = $"Your appointment with {appointment.Employee?.FullName ?? "Employee"} on {appointment.RequestedDate} has been cancelled.",
                NotificationType = "Warning",
                Channel = "InApp",
                CreatedAt = DateTimeOffset.UtcNow
            });

            if (!string.IsNullOrEmpty(appointment.Visitor.Email))
                await _emailService.SendAppointmentCancelledAsync(
                    appointment.Visitor.Email, appointment.Visitor.FullName,
                    appointment.Employee?.FullName ?? "",
                    appointment.Employee?.Department?.Name ?? "",
                    appointment.RequestedDate, appointment.RequestedStartTime,
                    appointment.RequestedEndTime, appointment.Purpose);
            if (!string.IsNullOrEmpty(appointment.Visitor.Phone))
                await _smsService.SendAppointmentNotificationAsync(appointment.Visitor.Phone, appointment.Visitor.FullName, appointment.Employee?.FullName ?? "", appointment.RequestedDate, "Cancelled");
        }

        if (appointment.Employee != null && !string.IsNullOrEmpty(appointment.Employee.Email))
        {
            await _emailService.SendEmployeeRequestCancelledAsync(
                appointment.Employee.Email, appointment.Employee.FullName,
                appointment.Visitor?.FullName ?? "",
                appointment.Employee.Department?.Name ?? "",
                appointment.RequestedDate, appointment.RequestedStartTime,
                appointment.RequestedEndTime, appointment.Purpose);
        }

        return MapToDto(appointment);
    }

    public async Task<AppointmentResponseDto> CompleteAsync(int id, int userId)
    {
        var appointment = await LoadWithDetailsAsync(id);
        if (appointment.Status != "Approved") throw new InvalidOperationException("Only approved appointments can be completed");

        appointment.Status = "Completed";
        appointment.UpdatedAt = DateTimeOffset.UtcNow;
        await _repository.UpdateAsync(appointment);

        return MapToDto(appointment);
    }

    public async Task<AppointmentResponseDto> DelegateAsync(int id, AppointmentDelegateDto dto, int userId)
    {
        var appointment = await LoadWithDetailsAsync(id);
        if (appointment.Status != "Approved" && appointment.Status != "Pending")
            throw new InvalidOperationException("Only pending or approved appointments can be delegated");

        var newEmployee = await _employeeRepository.GetByIdAsync(dto.NewEmployeeId)
            ?? throw new KeyNotFoundException("Target employee not found");

        if (appointment.DelegatedToEmployeeId == null)
            appointment.OriginalEmployeeId = appointment.EmployeeId;

        appointment.DelegatedToEmployeeId = dto.NewEmployeeId;
        appointment.EmployeeId = dto.NewEmployeeId;
        appointment.Status = "Delegated";
        appointment.UpdatedAt = DateTimeOffset.UtcNow;
        await _repository.UpdateAsync(appointment);

        await _notificationRepository.AddAsync(new Notification
        {
            EmployeeId = dto.NewEmployeeId,
            AppointmentId = appointment.Id,
            Title = "Appointment Delegated",
            Message = $"Appointment with {appointment.Visitor?.FullName ?? "Visitor"} has been delegated to you. Reason: {dto.Reason ?? "Not specified"}",
            NotificationType = "Info",
            Priority = "High",
            Channel = "InApp",
            CreatedAt = DateTimeOffset.UtcNow
        });

        if (appointment.Visitor != null)
        {
            await _visitorNotificationRepository.AddAsync(new VisitorNotification
            {
                VisitorId = appointment.VisitorId,
                AppointmentId = appointment.Id,
                Title = "Appointment Delegated",
                Message = $"Your appointment has been delegated to {newEmployee.FullName}. Reason: {dto.Reason ?? "Not specified"}",
                NotificationType = "Info",
                Channel = "InApp",
                CreatedAt = DateTimeOffset.UtcNow
            });
        }

        return MapToDto(appointment);
    }

    public async Task<AppointmentResponseDto> RedirectAsync(int id, AppointmentRedirectDto dto, int userId)
    {
        var appointment = await LoadWithDetailsAsync(id);
        if (appointment.Status != "Approved" && appointment.Status != "Pending")
            throw new InvalidOperationException("Only pending or approved appointments can be redirected");

        appointment.OriginalEmployeeId ??= appointment.EmployeeId;
        appointment.EmployeeId = dto.NewEmployeeId;
        if (dto.NewDepartmentId.HasValue)
            appointment.RedirectDepartmentId = dto.NewDepartmentId;
        appointment.UpdatedAt = DateTimeOffset.UtcNow;
        await _repository.UpdateAsync(appointment);

        var newEmployee = await _employeeRepository.GetByIdAsync(dto.NewEmployeeId);
        await _notificationRepository.AddAsync(new Notification
        {
            EmployeeId = dto.NewEmployeeId,
            AppointmentId = appointment.Id,
            Title = "Appointment Redirected",
            Message = $"Appointment with {appointment.Visitor?.FullName ?? "Visitor"} has been redirected to you. Reason: {dto.Reason ?? "Not specified"}",
            NotificationType = "Info",
            Priority = "High",
            Channel = "InApp",
            CreatedAt = DateTimeOffset.UtcNow
        });

        if (appointment.Visitor != null)
        {
            await _visitorNotificationRepository.AddAsync(new VisitorNotification
            {
                VisitorId = appointment.VisitorId,
                AppointmentId = appointment.Id,
                Title = "Appointment Redirected",
                Message = $"Your appointment has been redirected to {newEmployee?.FullName ?? "another employee"}. Reason: {dto.Reason ?? "Not specified"}",
                NotificationType = "Info",
                Channel = "InApp",
                CreatedAt = DateTimeOffset.UtcNow
            });
        }

        return MapToDto(appointment);
    }

    public async Task<AppointmentResponseDto> ToggleConfidentialAsync(int id)
    {
        var appointment = await _repository.GetByIdAsync(id) ?? throw new KeyNotFoundException("Appointment not found");
        appointment.IsConfidential = !appointment.IsConfidential;
        appointment.UpdatedAt = DateTimeOffset.UtcNow;
        await _repository.UpdateAsync(appointment);
        return MapToDto(appointment);
    }

    public async Task<IReadOnlyList<AppointmentResponseDto>> GetByVisitorAsync(int visitorId)
    {
        return (await _repository.GetByVisitorIdAsync(visitorId)).Select(MapToDto).ToList();
    }

    public async Task<IReadOnlyList<AppointmentResponseDto>> GetByEmployeeAsync(int employeeId)
    {
        return (await _repository.GetByEmployeeIdAsync(employeeId)).Select(MapToDto).ToList();
    }

    public async Task<IReadOnlyList<AppointmentResponseDto>> GetPendingAsync()
    {
        return (await _repository.GetPendingAsync()).Select(MapToDto).ToList();
    }

    public async Task<IReadOnlyList<AppointmentResponseDto>> GetPendingByEmployeeAsync(int employeeId)
    {
        return (await _repository.GetPendingByEmployeeIdAsync(employeeId)).Select(MapToDto).ToList();
    }

    public async Task<IReadOnlyList<AppointmentResponseDto>> GetTodayAsync()
    {
        return (await _repository.GetTodayAsync()).Select(MapToDto).ToList();
    }

    public async Task<IReadOnlyList<AppointmentResponseDto>> GetTodayByEmployeeAsync(int employeeId)
    {
        return (await _repository.GetTodayByEmployeeIdAsync(employeeId)).Select(MapToDto).ToList();
    }

    public async Task<IReadOnlyList<AppointmentResponseDto>> GetByDepartmentAsync(int departmentId)
    {
        return (await _repository.GetByDepartmentIdAsync(departmentId)).Select(MapToDto).ToList();
    }

    public async Task<IReadOnlyList<AppointmentResponseDto>> GetConfidentialAsync()
    {
        return (await _repository.GetConfidentialAsync()).Select(MapToDto).ToList();
    }

    public async Task<RescheduleResponseDto> RequestRescheduleAsync(int appointmentId, RescheduleRequestDto dto, int userId)
    {
        var appointment = await _repository.GetByIdAsync(appointmentId)
            ?? throw new KeyNotFoundException("Appointment not found");

        var request = new RescheduleRequest
        {
            AppointmentId = appointmentId,
            RequestedByUserId = userId,
            NewDate = dto.NewDate,
            NewStartTime = dto.NewStartTime,
            NewEndTime = dto.NewEndTime,
            Reason = dto.Reason,
            Status = "Pending",
            CreatedAt = DateTimeOffset.UtcNow
        };
        _context.RescheduleRequests.Add(request);
        await _context.SaveChangesAsync();

        appointment.Status = "Rescheduled";
        appointment.UpdatedAt = DateTimeOffset.UtcNow;
        await _repository.UpdateAsync(appointment);

        var requestingUser = await _context.Users.FindAsync(userId);

        if (appointment.Visitor != null)
        {
            await _visitorNotificationRepository.AddAsync(new VisitorNotification
            {
                VisitorId = appointment.VisitorId,
                AppointmentId = appointment.Id,
                Title = "Appointment Rescheduled",
                Message = $"Your appointment with {appointment.Employee?.FullName ?? "Employee"} has been rescheduled to {dto.NewDate}.",
                NotificationType = "Info",
                Channel = "InApp",
                CreatedAt = DateTimeOffset.UtcNow
            });

            if (!string.IsNullOrEmpty(appointment.Visitor.Email))
                await _emailService.SendAppointmentRescheduledAsync(
                    appointment.Visitor.Email, appointment.Visitor.FullName,
                    appointment.Employee?.FullName ?? "",
                    appointment.Employee?.Department?.Name ?? "",
                    appointment.RequestedDate, dto.NewDate,
                    dto.NewStartTime, dto.NewEndTime,
                    appointment.Purpose, dto.Reason);
        }

        if (appointment.Employee != null && !string.IsNullOrEmpty(appointment.Employee.Email))
        {
            await _emailService.SendEmployeeRequestRescheduledAsync(
                appointment.Employee.Email, appointment.Employee.FullName,
                appointment.Visitor?.FullName ?? "",
                appointment.Employee.Department?.Name ?? "",
                appointment.RequestedDate, dto.NewDate,
                dto.NewStartTime, dto.NewEndTime,
                appointment.Purpose, dto.Reason);
        }

        return new RescheduleResponseDto
        {
            Id = request.Id,
            AppointmentId = request.AppointmentId,
            RequestedByUserName = requestingUser?.FullName ?? "",
            NewDate = request.NewDate,
            NewStartTime = request.NewStartTime,
            NewEndTime = request.NewEndTime,
            Reason = request.Reason,
            Status = request.Status,
            CreatedAt = request.CreatedAt
        };
    }

    public async Task<RescheduleResponseDto> ApproveRescheduleAsync(int appointmentId, int requestId, int userId)
    {
        var request = await _context.RescheduleRequests
            .Include(r => r.RequestedByUser)
            .FirstOrDefaultAsync(r => r.Id == requestId && r.AppointmentId == appointmentId)
            ?? throw new KeyNotFoundException("Reschedule request not found");

        if (request.Status != "Pending") throw new InvalidOperationException("Only pending reschedule requests can be approved");

        request.Status = "Approved";
        request.RespondedByUserId = userId;
        request.RespondedAt = DateTimeOffset.UtcNow;

        var appointment = await _repository.GetByIdAsync(appointmentId)
            ?? throw new KeyNotFoundException("Appointment not found");
        appointment.RequestedDate = request.NewDate;
        appointment.RequestedStartTime = request.NewStartTime;
        appointment.RequestedEndTime = request.NewEndTime;
        appointment.Status = "Approved";
        appointment.UpdatedAt = DateTimeOffset.UtcNow;

        await _context.SaveChangesAsync();

        return new RescheduleResponseDto
        {
            Id = request.Id,
            AppointmentId = request.AppointmentId,
            RequestedByUserName = request.RequestedByUser?.FullName ?? "",
            NewDate = request.NewDate,
            NewStartTime = request.NewStartTime,
            NewEndTime = request.NewEndTime,
            Reason = request.Reason,
            Status = request.Status,
            CreatedAt = request.CreatedAt
        };
    }

    public async Task<RescheduleResponseDto> RejectRescheduleAsync(int appointmentId, int requestId, int userId)
    {
        var request = await _context.RescheduleRequests
            .Include(r => r.RequestedByUser)
            .FirstOrDefaultAsync(r => r.Id == requestId && r.AppointmentId == appointmentId)
            ?? throw new KeyNotFoundException("Reschedule request not found");

        if (request.Status != "Pending") throw new InvalidOperationException("Only pending reschedule requests can be rejected");

        request.Status = "Rejected";
        request.RespondedByUserId = userId;
        request.RespondedAt = DateTimeOffset.UtcNow;

        var appointment = await _repository.GetByIdAsync(appointmentId)
            ?? throw new KeyNotFoundException("Appointment not found");
        appointment.Status = "Approved";
        appointment.UpdatedAt = DateTimeOffset.UtcNow;

        await _context.SaveChangesAsync();

        return new RescheduleResponseDto
        {
            Id = request.Id,
            AppointmentId = request.AppointmentId,
            RequestedByUserName = request.RequestedByUser?.FullName ?? "",
            NewDate = request.NewDate,
            NewStartTime = request.NewStartTime,
            NewEndTime = request.NewEndTime,
            Reason = request.Reason,
            Status = request.Status,
            CreatedAt = request.CreatedAt
        };
    }

    public async Task<List<AppointmentAttachmentDto>> GetAttachmentsAsync(int appointmentId)
    {
        return await _context.AppointmentAttachments
            .Where(a => a.AppointmentId == appointmentId)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new AppointmentAttachmentDto
            {
                Id = a.Id,
                FileName = a.FileName,
                FilePath = a.FilePath,
                FileSize = a.FileSize,
                ContentType = a.ContentType,
                CreatedAt = a.CreatedAt
            }).ToListAsync();
    }

    public async Task<AppointmentAttachmentDto> UploadAttachmentAsync(int appointmentId, string fileName, string filePath, int fileSize, string contentType, int userId)
    {
        _ = await _repository.GetByIdAsync(appointmentId) ?? throw new KeyNotFoundException("Appointment not found");
        var attachment = new AppointmentAttachment
        {
            AppointmentId = appointmentId,
            FileName = fileName,
            FilePath = filePath,
            FileSize = fileSize,
            ContentType = contentType,
            UploadedBy = userId,
            CreatedAt = DateTimeOffset.UtcNow
        };
        _context.AppointmentAttachments.Add(attachment);
        await _context.SaveChangesAsync();
        return new AppointmentAttachmentDto
        {
            Id = attachment.Id,
            FileName = attachment.FileName,
            FilePath = attachment.FilePath,
            FileSize = attachment.FileSize,
            ContentType = attachment.ContentType,
            CreatedAt = attachment.CreatedAt
        };
    }

    public async Task DeleteAttachmentAsync(int appointmentId, int attachmentId)
    {
        var attachment = await _context.AppointmentAttachments
            .FirstOrDefaultAsync(a => a.Id == attachmentId && a.AppointmentId == appointmentId)
            ?? throw new KeyNotFoundException("Attachment not found");
        _context.AppointmentAttachments.Remove(attachment);
        await _context.SaveChangesAsync();
    }

    public async Task<List<AppointmentCommentDto>> GetCommentsAsync(int appointmentId)
    {
        return await _context.AppointmentComments
            .Include(c => c.User)
            .Where(c => c.AppointmentId == appointmentId)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new AppointmentCommentDto
            {
                Id = c.Id,
                UserName = c.User.FullName,
                UserRole = c.User.Role,
                CommentText = c.CommentText,
                IsInternal = c.IsInternal,
                CreatedAt = c.CreatedAt
            }).ToListAsync();
    }

    public async Task<AppointmentCommentDto> AddCommentAsync(int appointmentId, AppointmentCommentCreateDto dto, int userId)
    {
        _ = await _repository.GetByIdAsync(appointmentId) ?? throw new KeyNotFoundException("Appointment not found");
        var user = await _context.Users.FindAsync(userId) ?? throw new KeyNotFoundException("User not found");
        var comment = new AppointmentComment
        {
            AppointmentId = appointmentId,
            UserId = userId,
            CommentText = dto.CommentText,
            IsInternal = dto.IsInternal,
            CreatedAt = DateTimeOffset.UtcNow
        };
        _context.AppointmentComments.Add(comment);
        await _context.SaveChangesAsync();
        return new AppointmentCommentDto
        {
            Id = comment.Id,
            UserName = user.FullName,
            UserRole = user.Role,
            CommentText = comment.CommentText,
            IsInternal = comment.IsInternal,
            CreatedAt = comment.CreatedAt
        };
    }

    public async Task HandleEmployeeUnavailabilityAsync(int employeeId, string type, DateOnly startDate, DateOnly? endDate, string? reason, int createdByUserId)
    {
        var effectiveEndDate = endDate ?? startDate;
        var affectedAppointments = await _context.Appointments
            .Include(a => a.Visitor)
            .Include(a => a.Employee)
            .Where(a => a.EmployeeId == employeeId
                && a.RequestedDate >= startDate
                && a.RequestedDate <= effectiveEndDate
                && (a.Status == "Pending" || a.Status == "Approved"))
            .ToListAsync();

        foreach (var appointment in affectedAppointments)
        {
            appointment.Status = "EmployeeUnavailable";
            appointment.UpdatedAt = DateTimeOffset.UtcNow;

            if (appointment.Visitor != null)
            {
                await _visitorNotificationRepository.AddAsync(new VisitorNotification
                {
                    VisitorId = appointment.VisitorId,
                    AppointmentId = appointment.Id,
                    Title = "Employee Unavailable",
                    Message = $"Your appointment with {appointment.Employee?.FullName ?? "Employee"} on {appointment.RequestedDate} has been affected due to employee unavailability ({type}). Reason: {reason ?? "Not specified"}",
                    NotificationType = "Warning",
                    Channel = "InApp",
                    CreatedAt = DateTimeOffset.UtcNow
                });
            }
        }

        await _context.SaveChangesAsync();
    }

    private async Task<Appointment> LoadWithDetailsAsync(int id)
    {
        var appointment = await _context.Appointments
            .Include(a => a.Visitor)
            .Include(a => a.Employee)
            .ThenInclude(e => e.Department)
            .Include(a => a.DelegatedToEmployee)
            .Include(a => a.OriginalEmployee)
            .Include(a => a.Attachments)
            .Include(a => a.Comments)
            .FirstOrDefaultAsync(a => a.Id == id);
        return appointment ?? throw new KeyNotFoundException("Appointment not found");
    }

    private static string GenerateCode() => $"APT-{Guid.NewGuid().ToString("N")[..8].ToUpper()}";

    private static AppointmentResponseDto MapToDto(Appointment a) => new()
    {
        Id = a.Id,
        VisitorId = a.VisitorId,
        VisitorName = a.Visitor?.FullName ?? "",
        VisitorEmail = a.Visitor?.Email ?? "",
        VisitorPhone = a.Visitor?.Phone ?? "",
        EmployeeId = a.EmployeeId,
        EmployeeName = a.Employee?.FullName ?? "",
        EmployeePosition = a.Employee?.Position ?? "",
        DepartmentName = a.Employee?.Department?.Name ?? "",
        RequestedDate = a.RequestedDate,
        RequestedStartTime = a.RequestedStartTime,
        RequestedEndTime = a.RequestedEndTime,
        Purpose = a.Purpose,
        Status = a.Status,
        EmployeeResponse = a.EmployeeResponse,
        ApprovalDate = a.ApprovalDate,
        CheckInAllowed = a.CheckInAllowed,
        IsConfidential = a.IsConfidential,
        AppointmentCode = a.AppointmentCode,
        RejectionReason = a.RejectionReason,
        Notes = a.Notes,
        DelegatedToEmployeeId = a.DelegatedToEmployeeId,
        DelegatedToEmployeeName = a.DelegatedToEmployee?.FullName,
        OriginalEmployeeId = a.OriginalEmployeeId,
        OriginalEmployeeName = a.OriginalEmployee?.FullName,
        Attachments = a.Attachments?.Select(aa => new AppointmentAttachmentDto
        {
            Id = aa.Id,
            FileName = aa.FileName,
            FilePath = aa.FilePath,
            FileSize = aa.FileSize,
            ContentType = aa.ContentType,
            CreatedAt = aa.CreatedAt
        }).ToList() ?? new(),
        CommentCount = a.Comments?.Count ?? 0,
        CreatedAt = a.CreatedAt,
        UpdatedAt = a.UpdatedAt
    };
}
