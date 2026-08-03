using Microsoft.EntityFrameworkCore;
using EcxVisitorManagement.Data;
using EcxVisitorManagement.DTOs.Appointments;
using EcxVisitorManagement.DTOs.Common;
using EcxVisitorManagement.Interfaces;
using EcxVisitorManagement.Models;

namespace EcxVisitorManagement.Services.Implementation;

public class AppointmentService : IAppointmentService
{
    private static readonly string[] AllowedSupportingLetterExtensions = { ".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png" };
    private static readonly string[] AllowedSupportingLetterContentTypes =
    {
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/png"
    };
    private const long MaxSupportingLetterSize = 10L * 1024 * 1024;

    private readonly IAppointmentRepository _repository;
    private readonly INotificationRepository _notificationRepository;
    private readonly IVisitorNotificationRepository _visitorNotificationRepository;
    private readonly IVisitorRepository _visitorRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IEmailService _emailService;
    private readonly ISmsService _smsService;
    private readonly IWebHostEnvironment _env;
    private readonly AppDbContext _context;
    private readonly ILogger<AppointmentService> _logger;

    public AppointmentService(
        IAppointmentRepository repository,
        INotificationRepository notificationRepository,
        IVisitorNotificationRepository visitorNotificationRepository,
        IVisitorRepository visitorRepository,
        IEmployeeRepository employeeRepository,
        IEmailService emailService,
        ISmsService smsService,
        IWebHostEnvironment env,
        AppDbContext context,
        ILogger<AppointmentService> logger)
    {
        _repository = repository;
        _notificationRepository = notificationRepository;
        _visitorNotificationRepository = visitorNotificationRepository;
        _visitorRepository = visitorRepository;
        _employeeRepository = employeeRepository;
        _emailService = emailService;
        _smsService = smsService;
        _env = env;
        _context = context;
        _logger = logger;
    }

    public async Task<PagedResponse<AppointmentResponseDto>> GetAllAsync(PageRequest request)
    {
        var paged = await _repository.GetPagedAsync(request);
        _logger.LogInformation("[Appointments:GetAll] Status={Status} DateFrom={DateFrom} DateTo={DateTo} Search={Search} => TotalCount={TotalCount}",
            request.Status, request.DateFrom, request.DateTo, request.Search, paged.TotalCount);
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
        if (dto.AppointmentMethod == "ReceptionAssistance")
            dto.RouteType = "Reception";

        if (dto.RouteType == "Reception")
        {
            var receptionistUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Role == "Receptionist" && u.EmployeeId.HasValue);
            if (receptionistUser?.EmployeeId != null)
                dto.EmployeeId = receptionistUser.EmployeeId.Value;
            else
                throw new InvalidOperationException("No receptionist is configured to receive routed appointments.");
        }

        if (dto.EmployeeId <= 0)
            throw new InvalidOperationException("A host employee is required. Please select a department and host employee.");

        var supportingLetter = dto.SupportingLetter != null && dto.SupportingLetter.Length > 0
            ? await SaveSupportingLetterAsync(dto.SupportingLetter)
            : null;

        var appointment = new Appointment
        {
            VisitorId = dto.VisitorId,
            EmployeeId = dto.EmployeeId,
            RequestedDate = dto.RequestedDate,
            RequestedStartTime = dto.RequestedStartTime,
            RequestedEndTime = dto.RequestedEndTime,
            Purpose = dto.Purpose,
            IsConfidential = dto.IsConfidential,
            RouteType = dto.RouteType,
            AppointmentMethod = dto.AppointmentMethod,
            Notes = dto.Notes,
            Status = "Pending",
            AppointmentCode = GenerateCode(),
            AttachmentFileName = supportingLetter?.FileName,
            AttachmentOriginalFileName = supportingLetter?.OriginalFileName,
            AttachmentPath = supportingLetter?.FilePath,
            AttachmentSize = supportingLetter?.FileSize,
            AttachmentContentType = supportingLetter?.ContentType,
            AttachmentUploadedAt = supportingLetter != null ? DateTimeOffset.UtcNow : null,
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
                dto.Purpose, dto.Notes,
                hasSupportingLetter: appointment.AttachmentPath != null);
        }

        if (!dto.IsConfidential)
        {
            var receptionEmployeeId = await GetReceptionEmployeeIdAsync();
            if (receptionEmployeeId.HasValue && receptionEmployeeId.Value != dto.EmployeeId)
            {
                await _notificationRepository.AddAsync(new Notification
                {
                    EmployeeId = receptionEmployeeId.Value,
                    AppointmentId = created.Id,
                    Title = "New Non-Confidential Visit",
                    Message = $"A non-confidential appointment with {visitor?.FullName ?? "Visitor"} on {dto.RequestedDate} has been requested. No approval required; be ready to guide the visitor on arrival.",
                    NotificationType = "Info",
                    Priority = "Normal",
                    Channel = "InApp",
                    CreatedAt = DateTimeOffset.UtcNow
                });
            }

            foreach (var securityEmployee in await GetSecurityEmployeesAsync())
            {
                await _notificationRepository.AddAsync(new Notification
                {
                    EmployeeId = securityEmployee.Id,
                    AppointmentId = created.Id,
                    Title = "Upcoming Non-Confidential Visit",
                    Message = $"A non-confidential appointment with {visitor?.FullName ?? "Visitor"} on {dto.RequestedDate} has been scheduled. No approval required.",
                    NotificationType = "Info",
                    Priority = "Normal",
                    Channel = "InApp",
                    CreatedAt = DateTimeOffset.UtcNow
                });
            }
        }

        _logger.LogInformation("[Appointment:Created] AppointmentId={AppointmentId} VisitorId={VisitorId} VisitorName={VisitorName} EmployeeId={EmployeeId} DepartmentId={DepartmentId} AppointmentDate={AppointmentDate} AppointmentStatus={AppointmentStatus}",
            created.Id, dto.VisitorId, visitor?.FullName ?? "", dto.EmployeeId, employee?.DepartmentId, dto.RequestedDate, created.Status);

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

        if (appointment.IsConfidential)
        {
            var visitorName = appointment.Visitor?.FullName ?? "Visitor";
            var date = appointment.RequestedDate;
            var subject = "Confidential Appointment Approved";
            var message = $"A confidential appointment with {visitorName} on {date} has been approved. Security personnel should be prepared for the visit.";

            foreach (var securityEmployee in await GetSecurityEmployeesAsync())
            {
                await _notificationRepository.AddAsync(new Notification
                {
                    EmployeeId = securityEmployee.Id,
                    AppointmentId = appointment.Id,
                    Title = "Confidential Appointment Approved",
                    Message = message,
                    NotificationType = "Info",
                    Priority = "High",
                    Channel = "InApp",
                    CreatedAt = DateTimeOffset.UtcNow
                });

                if (!string.IsNullOrEmpty(securityEmployee.Email))
                    await _emailService.SendAsync(securityEmployee.Email, subject,
                        $"<p>Dear {securityEmployee.FullName},</p><p>{message}</p>");
            }

            var securityDepartment = await _context.Departments.FirstOrDefaultAsync(d => d.Name == "Security");
            if (securityDepartment != null && !string.IsNullOrEmpty(securityDepartment.Email))
                await _emailService.SendAsync(securityDepartment.Email, subject, $"<p>{message}</p>");
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

    public async Task<AppointmentResponseDto> RedirectToDepartmentAsync(int id, AppointmentDepartmentRedirectDto dto, int userId)
    {
        var appointment = await LoadWithDetailsAsync(id);
        if (appointment.Status is "Completed" or "Cancelled" or "Rejected")
            throw new InvalidOperationException("Only active appointments can be redirected to a department");

        var targetDepartment = await _context.Departments.FindAsync(dto.NewDepartmentId)
            ?? throw new KeyNotFoundException("Target department not found");

        appointment.RedirectedFromDepartmentId ??= appointment.Employee?.DepartmentId;
        appointment.AssignedDepartmentId = targetDepartment.Id;
        appointment.RedirectReason = dto.Reason;
        appointment.Status = "PendingAssignment";
        appointment.UpdatedAt = DateTimeOffset.UtcNow;
        await _repository.UpdateAsync(appointment);

        var deptEmployees = await _context.Employees
            .Where(e => e.DepartmentId == targetDepartment.Id && e.Status == "Active")
            .ToListAsync();

        foreach (var deptEmployee in deptEmployees)
        {
            await _notificationRepository.AddAsync(new Notification
            {
                EmployeeId = deptEmployee.Id,
                AppointmentId = appointment.Id,
                Title = "Appointment Awaiting Assignment",
                Message = $"Appointment with {appointment.Visitor?.FullName ?? "Visitor"} has been redirected to {targetDepartment.Name} and awaits assignment. Reason: {dto.Reason ?? "Not specified"}",
                NotificationType = "Info",
                Priority = "High",
                Channel = "InApp",
                CreatedAt = DateTimeOffset.UtcNow
            });
        }

        if (appointment.Visitor != null)
        {
            await _visitorNotificationRepository.AddAsync(new VisitorNotification
            {
                VisitorId = appointment.VisitorId,
                AppointmentId = appointment.Id,
                Title = "Appointment Redirected",
                Message = $"Your appointment has been redirected to the {targetDepartment.Name} department and is awaiting assignment. Reason: {dto.Reason ?? "Not specified"}",
                NotificationType = "Info",
                Channel = "InApp",
                CreatedAt = DateTimeOffset.UtcNow
            });

            if (!string.IsNullOrEmpty(appointment.Visitor.Email))
                await _emailService.SendAsync(appointment.Visitor.Email, "Your appointment has been redirected",
                    $"<p>Dear {appointment.Visitor.FullName},</p><p>Your appointment with {appointment.Employee?.FullName ?? "ECX"} on {appointment.RequestedDate} has been redirected to the <strong>{targetDepartment.Name}</strong> department.</p><p>Reason: {dto.Reason ?? "Not specified"}</p><p>You will be notified once an employee is assigned to your appointment.</p>");
        }

        return MapToDto(await LoadWithDetailsAsync(id));
    }

    public async Task<AppointmentResponseDto> AssignEmployeeAsync(int id, AppointmentAssignDto dto, int userId)
    {
        var appointment = await LoadWithDetailsAsync(id);
        if (appointment.Status != "PendingAssignment")
            throw new InvalidOperationException("Only appointments awaiting assignment can be assigned to an employee");

        var newEmployee = await _employeeRepository.GetByIdAsync(dto.NewEmployeeId)
            ?? throw new KeyNotFoundException("Target employee not found");

        appointment.AssignedEmployeeId = newEmployee.Id;
        appointment.AssignedBy = userId;
        appointment.AssignedAt = DateTimeOffset.UtcNow;
        appointment.EmployeeId = newEmployee.Id;
        appointment.Status = "Pending";
        appointment.UpdatedAt = DateTimeOffset.UtcNow;
        await _repository.UpdateAsync(appointment);

        await _notificationRepository.AddAsync(new Notification
        {
            EmployeeId = newEmployee.Id,
            AppointmentId = appointment.Id,
            Title = "Appointment Assigned",
            Message = $"Appointment with {appointment.Visitor?.FullName ?? "Visitor"} on {appointment.RequestedDate} has been assigned to you.",
            NotificationType = "Info",
            Priority = "High",
            Channel = "InApp",
            CreatedAt = DateTimeOffset.UtcNow
        });

        if (!string.IsNullOrEmpty(newEmployee.Email))
            await _emailService.SendEmployeeNewRequestAsync(
                newEmployee.Email, newEmployee.FullName, appointment.Visitor?.FullName ?? "",
                newEmployee.Department?.Name ?? "", appointment.RequestedDate,
                appointment.RequestedStartTime, appointment.RequestedEndTime,
                appointment.Purpose, dto.Notes,
                hasSupportingLetter: appointment.AttachmentPath != null);

        if (appointment.Visitor != null)
        {
            await _visitorNotificationRepository.AddAsync(new VisitorNotification
            {
                VisitorId = appointment.VisitorId,
                AppointmentId = appointment.Id,
                Title = "Appointment Assigned",
                Message = $"Your appointment has been assigned to {newEmployee.FullName} ({newEmployee.Department?.Name ?? ""}).",
                NotificationType = "Info",
                Channel = "InApp",
                CreatedAt = DateTimeOffset.UtcNow
            });

            if (!string.IsNullOrEmpty(appointment.Visitor.Email))
                await _emailService.SendAsync(appointment.Visitor.Email, "An employee has been assigned to your appointment",
                    $"<p>Dear {appointment.Visitor.FullName},</p><p>Your appointment has been assigned to <strong>{newEmployee.FullName}</strong> in the {newEmployee.Department?.Name ?? ""} department.</p><p>You will be notified once your appointment is approved.</p>");
        }

        return MapToDto(await LoadWithDetailsAsync(id));
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

    public async Task<SupportingLetterDownloadDto?> GetSupportingLetterAsync(int appointmentId)
    {
        var appointment = await _context.Appointments
            .Where(a => a.Id == appointmentId)
            .Select(a => new { a.AttachmentPath, a.AttachmentOriginalFileName, a.AttachmentContentType })
            .FirstOrDefaultAsync()
            ?? throw new KeyNotFoundException("Appointment not found");

        if (string.IsNullOrEmpty(appointment.AttachmentPath))
            return null;

        var fullPath = ResolveSupportingLetterPath(appointment.AttachmentPath);
        if (!File.Exists(fullPath))
            throw new InvalidOperationException("The supporting letter file is missing.");

        return new SupportingLetterDownloadDto
        {
            FullPath = fullPath,
            OriginalFileName = appointment.AttachmentOriginalFileName ?? "supporting-letter",
            ContentType = string.IsNullOrWhiteSpace(appointment.AttachmentContentType)
                ? "application/octet-stream"
                : appointment.AttachmentContentType
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
            .Include(a => a.AssignedDepartment)
            .Include(a => a.AssignedEmployee)
            .Include(a => a.RedirectedFromDepartment)
            .Include(a => a.Attachments)
            .Include(a => a.Comments)
            .FirstOrDefaultAsync(a => a.Id == id);
        return appointment ?? throw new KeyNotFoundException("Appointment not found");
    }

    private async Task<int?> GetReceptionEmployeeIdAsync()
    {
        var receptionistUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Role == "Receptionist" && u.EmployeeId.HasValue);
        return receptionistUser?.EmployeeId;
    }

    private async Task<IReadOnlyList<Employee>> GetSecurityEmployeesAsync()
    {
        var securityDepartment = await _context.Departments.FirstOrDefaultAsync(d => d.Name == "Security");
        if (securityDepartment == null) return Array.Empty<Employee>();
        return await _context.Employees
            .Where(e => e.DepartmentId == securityDepartment.Id && e.Status == "Active")
            .ToListAsync();
    }

    private async Task<SupportingLetterDto?> SaveSupportingLetterAsync(IFormFile file)
    {
        ValidateSupportingLetter(file);

        var safeOriginalName = Path.GetFileName(file.FileName).Trim();
        if (string.IsNullOrWhiteSpace(safeOriginalName))
            safeOriginalName = "supporting-letter";

        var extension = Path.GetExtension(safeOriginalName).ToLowerInvariant();
        var fileName = $"{Guid.NewGuid():N}{extension}";
        var directory = Path.Combine(_env.ContentRootPath, "uploads", "appointments", "supporting-letters");
        Directory.CreateDirectory(directory);

        var fullPath = Path.Combine(directory, fileName);
        await using (var stream = new FileStream(fullPath, FileMode.Create, FileAccess.Write))
        {
            await file.CopyToAsync(stream);
        }

        return new SupportingLetterDto
        {
            FileName = fileName,
            OriginalFileName = safeOriginalName,
            FilePath = fileName,
            FileSize = file.Length,
            ContentType = file.ContentType,
            UploadedAt = DateTimeOffset.UtcNow
        };
    }

    private static void ValidateSupportingLetter(IFormFile file)
    {
        if (file.Length == 0)
            throw new InvalidOperationException("The uploaded supporting letter is empty.");

        if (file.Length > MaxSupportingLetterSize)
            throw new InvalidOperationException("The supporting letter exceeds the maximum allowed size of 10 MB.");

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedSupportingLetterExtensions.Contains(extension))
            throw new InvalidOperationException("Unsupported file type. Only PDF, DOC, DOCX, JPG, JPEG, and PNG files are allowed.");

        var isKnownContentType = AllowedSupportingLetterContentTypes.Contains(file.ContentType, StringComparer.OrdinalIgnoreCase);
        var isOctetStream = string.Equals(file.ContentType, "application/octet-stream", StringComparison.OrdinalIgnoreCase);
        if (!isKnownContentType && !isOctetStream)
            throw new InvalidOperationException("Unsupported file type. Only PDF, DOC, DOCX, JPG, JPEG, and PNG files are allowed.");
    }

    private string ResolveSupportingLetterPath(string storedPath)
    {
        var fileName = Path.GetFileName(storedPath);
        if (string.IsNullOrWhiteSpace(fileName) || fileName != storedPath)
            throw new InvalidOperationException("Invalid supporting letter path.");

        return Path.Combine(_env.ContentRootPath, "uploads", "appointments", "supporting-letters", fileName);
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
        RouteType = a.RouteType,
        AppointmentMethod = a.AppointmentMethod,
        AppointmentCode = a.AppointmentCode,
        RejectionReason = a.RejectionReason,
        Notes = a.Notes,
        SupportingLetter = a.AttachmentPath == null ? null : new SupportingLetterDto
        {
            FileName = a.AttachmentFileName ?? "",
            OriginalFileName = a.AttachmentOriginalFileName ?? "",
            FilePath = a.AttachmentPath ?? "",
            FileSize = a.AttachmentSize ?? 0,
            ContentType = a.AttachmentContentType ?? "",
            UploadedAt = a.AttachmentUploadedAt
        },
        DelegatedToEmployeeId = a.DelegatedToEmployeeId,
        DelegatedToEmployeeName = a.DelegatedToEmployee?.FullName,
        OriginalEmployeeId = a.OriginalEmployeeId,
        OriginalEmployeeName = a.OriginalEmployee?.FullName,
        AssignedDepartmentId = a.AssignedDepartmentId,
        AssignedDepartmentName = a.AssignedDepartment?.Name,
        AssignedEmployeeId = a.AssignedEmployeeId,
        AssignedEmployeeName = a.AssignedEmployee?.FullName,
        RedirectedFromDepartmentId = a.RedirectedFromDepartmentId,
        RedirectedFromDepartmentName = a.RedirectedFromDepartment?.Name,
        RedirectReason = a.RedirectReason,
        AssignedBy = a.AssignedBy,
        AssignedAt = a.AssignedAt,
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
