using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EcxVisitorManagement.Data;
using EcxVisitorManagement.DTOs.Appointments;
using EcxVisitorManagement.DTOs.Common;
using EcxVisitorManagement.Extensions;
using EcxVisitorManagement.Interfaces;

namespace EcxVisitorManagement.Controllers;

[ApiController]
[Route("api/appointments")]
[Authorize]
public class AppointmentsController : ControllerBase
{
    private readonly IAppointmentService _appointmentService;
    private readonly AppDbContext _context;
    private readonly ILogger<AppointmentsController> _logger;

    public AppointmentsController(IAppointmentService appointmentService, AppDbContext context, ILogger<AppointmentsController> logger)
    {
        _appointmentService = appointmentService;
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] PageRequest request)
    {
        if (User.IsSuperAdmin() || User.GetRole() == "Receptionist")
        {
            var result = await _appointmentService.GetAllAsync(request);
            return Ok(ApiResponse<PagedResponse<AppointmentResponseDto>>.Ok(result));
        }

        if (User.GetRole() == "DepartmentHead")
        {
            var departmentId = await GetCurrentEmployeeDepartmentIdAsync();
            if (departmentId == null) return Forbid();

            var deptResult = await _appointmentService.GetAllByDepartmentAsync(departmentId.Value, request);
            return Ok(ApiResponse<PagedResponse<AppointmentResponseDto>>.Ok(deptResult));
        }

        var employeeId = User.GetEmployeeId();
        if (employeeId != null)
        {
            var empResult = await _appointmentService.GetAllByEmployeeAsync(employeeId.Value, request);
            return Ok(ApiResponse<PagedResponse<AppointmentResponseDto>>.Ok(empResult));
        }

        var visitorId = User.GetVisitorId();
        if (visitorId != null)
        {
            var visitorResult = await _appointmentService.GetAllByVisitorAsync(visitorId.Value, request);
            return Ok(ApiResponse<PagedResponse<AppointmentResponseDto>>.Ok(visitorResult));
        }

        return Forbid();
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var role = User.GetRole();
        var employeeId = User.GetEmployeeId();
        var visitorId = User.GetVisitorId();
        _logger.LogInformation("[Appointments:GetById] Endpoint hit. AppointmentId={Id} Role={Role} EmployeeId={EmployeeId} VisitorId={VisitorId}",
            id, role, employeeId, visitorId);

        var result = await _appointmentService.GetByIdAsync(id);
        if (result == null) return NotFound(ApiResponse<AppointmentResponseDto>.NotFound("Appointment not found"));

        if (!await CanViewAppointmentAsync(result))
        {
            _logger.LogWarning("[Appointments:GetById] AppointmentId={Id} access denied for Role={Role} EmployeeId={EmployeeId} VisitorId={VisitorId}",
                id, role, employeeId, visitorId);
            return Forbid();
        }

        _logger.LogInformation("[Appointments:GetById] AppointmentId={Id} returning OK", id);
        return Ok(ApiResponse<AppointmentResponseDto>.Ok(result, "Appointment retrieved successfully."));
    }

    [HttpPost]
    [RequestSizeLimit(11 * 1024 * 1024)]
    public async Task<IActionResult> Create([FromForm] AppointmentCreateDto dto)
    {
        var result = await _appointmentService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<AppointmentResponseDto>.Created(result));
    }

    [HttpGet("{id}/supporting-letter")]
    public async Task<IActionResult> GetSupportingLetter(int id, [FromQuery] bool download = false)
    {
        var appointment = await _appointmentService.GetByIdAsync(id);
        if (appointment == null)
            return NotFound(ApiResponse<object>.NotFound("Appointment not found"));

        if (!await CanViewAppointmentAsync(appointment))
            return Forbid();

        try
        {
            var file = await _appointmentService.GetSupportingLetterAsync(id);
            if (file == null)
                return NotFound(ApiResponse<object>.NotFound("No supporting letter uploaded for this appointment."));

            var stream = new FileStream(file.FullPath, FileMode.Open, FileAccess.Read, FileShare.Read);
            return download
                ? File(stream, file.ContentType, file.OriginalFileName)
                : File(stream, file.ContentType);
        }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse<object>.NotFound(ex.Message)); }
        catch (InvalidOperationException ex) { return BadRequest(ApiResponse<object>.BadRequest(ex.Message)); }
    }

    [HttpGet("{id}/property-authorization-letter")]
    public async Task<IActionResult> GetPropertyAuthorizationLetter(int id, [FromQuery] bool download = false)
    {
        var appointment = await _appointmentService.GetByIdAsync(id);
        if (appointment == null)
            return NotFound(ApiResponse<object>.NotFound("Appointment not found"));

        if (!await CanViewAppointmentAsync(appointment))
            return Forbid();

        try
        {
            var file = await _appointmentService.GetPropertyAuthorizationLetterAsync(id);
            if (file == null)
                return NotFound(ApiResponse<object>.NotFound("No property authorization letter uploaded for this appointment."));

            var stream = new FileStream(file.FullPath, FileMode.Open, FileAccess.Read, FileShare.Read);
            return download
                ? File(stream, file.ContentType, file.OriginalFileName)
                : File(stream, file.ContentType);
        }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse<object>.NotFound(ex.Message)); }
        catch (InvalidOperationException ex) { return BadRequest(ApiResponse<object>.BadRequest(ex.Message)); }
    }

    [HttpGet("property-verifications")]
    [Authorize(Roles = "Security,Admin")]
    public async Task<IActionResult> GetPropertyVerifications()
    {
        var result = await _appointmentService.GetPropertyVerificationsAsync();
        return Ok(ApiResponse<IReadOnlyList<AppointmentResponseDto>>.Ok(result));
    }

    [HttpGet("property-verifications/verified")]
    [Authorize(Roles = "Security,Admin")]
    public async Task<IActionResult> GetVerifiedPropertyVerifications()
    {
        var result = await _appointmentService.GetVerifiedPropertyVerificationsAsync();
        return Ok(ApiResponse<IReadOnlyList<AppointmentResponseDto>>.Ok(result));
    }

    [HttpPost("{id}/verify-properties")]
    [Authorize(Roles = "Security,Admin")]
    public async Task<IActionResult> VerifyProperties(int id, [FromBody] VerifyAppointmentPropertiesDto dto)
    {
        try
        {
            var result = await _appointmentService.VerifyPropertiesAsync(id, dto?.PropertyIds ?? new List<int>(), User.GetUserId());
            return Ok(ApiResponse<AppointmentResponseDto>.Ok(result, "Property items verified"));
        }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse<AppointmentResponseDto>.NotFound(ex.Message)); }
        catch (InvalidOperationException ex) { return BadRequest(ApiResponse<AppointmentResponseDto>.BadRequest(ex.Message)); }
    }

    [HttpPost("{id}/save-property-verification")]
    [Authorize(Roles = "Security,Admin")]
    public async Task<IActionResult> SavePropertyVerification(int id, [FromBody] SavePropertyVerificationDto dto)
    {
        try
        {
            var result = await _appointmentService.SavePropertyVerificationAsync(id, dto, User.GetUserId());
            return Ok(ApiResponse<AppointmentResponseDto>.Ok(result, "Property verification saved"));
        }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse<AppointmentResponseDto>.NotFound(ex.Message)); }
        catch (InvalidOperationException ex) { return BadRequest(ApiResponse<AppointmentResponseDto>.BadRequest(ex.Message)); }
    }

    [HttpPost("{id}/approve")]
    public async Task<IActionResult> Approve(int id)
    {
        try
        {
            var ownerId = await EnsureOwnershipAsync(id);
            if (ownerId == null) return Forbid();
            var result = await _appointmentService.ApproveAsync(id, ownerId.Value);
            return Ok(ApiResponse<AppointmentResponseDto>.Ok(result, "Appointment approved"));
        }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse<AppointmentResponseDto>.NotFound(ex.Message)); }
        catch (InvalidOperationException ex) { return BadRequest(ApiResponse<AppointmentResponseDto>.BadRequest(ex.Message)); }
    }

    [HttpPost("{id}/reject")]
    public async Task<IActionResult> Reject(int id, [FromBody] AppointmentRejectDto dto)
    {
        try
        {
            var ownerId = await EnsureOwnershipAsync(id);
            if (ownerId == null) return Forbid();
            var result = await _appointmentService.RejectAsync(id, dto, ownerId.Value);
            return Ok(ApiResponse<AppointmentResponseDto>.Ok(result, "Appointment rejected"));
        }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse<AppointmentResponseDto>.NotFound(ex.Message)); }
        catch (InvalidOperationException ex) { return BadRequest(ApiResponse<AppointmentResponseDto>.BadRequest(ex.Message)); }
    }

    [HttpPost("{id}/cancel")]
    public async Task<IActionResult> Cancel(int id)
    {
        try
        {
            var ownerId = await EnsureOwnershipAsync(id);
            if (ownerId == null) return Forbid();
            var result = await _appointmentService.CancelAsync(id, ownerId.Value);
            return Ok(ApiResponse<AppointmentResponseDto>.Ok(result, "Appointment cancelled"));
        }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse<AppointmentResponseDto>.NotFound(ex.Message)); }
        catch (InvalidOperationException ex) { return BadRequest(ApiResponse<AppointmentResponseDto>.BadRequest(ex.Message)); }
    }

    [HttpPost("{id}/complete")]
    public async Task<IActionResult> Complete(int id)
    {
        try
        {
            var ownerId = await EnsureOwnershipAsync(id);
            if (ownerId == null) return Forbid();
            var result = await _appointmentService.CompleteAsync(id, ownerId.Value);
            return Ok(ApiResponse<AppointmentResponseDto>.Ok(result, "Appointment completed"));
        }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse<AppointmentResponseDto>.NotFound(ex.Message)); }
        catch (InvalidOperationException ex) { return BadRequest(ApiResponse<AppointmentResponseDto>.BadRequest(ex.Message)); }
    }

    [HttpPost("{id}/delegate")]
    public async Task<IActionResult> Delegate(int id, [FromBody] AppointmentDelegateDto dto)
    {
        try
        {
            var ownerId = await EnsureOwnershipAsync(id);
            if (ownerId == null) return Forbid();
            var result = await _appointmentService.DelegateAsync(id, dto, ownerId.Value);
            return Ok(ApiResponse<AppointmentResponseDto>.Ok(result, "Appointment delegated"));
        }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse<AppointmentResponseDto>.NotFound(ex.Message)); }
        catch (InvalidOperationException ex) { return BadRequest(ApiResponse<AppointmentResponseDto>.BadRequest(ex.Message)); }
    }

    [HttpPost("{id}/redirect")]
    public async Task<IActionResult> Redirect(int id, [FromBody] AppointmentRedirectDto dto)
    {
        try
        {
            var ownerId = await EnsureOwnershipAsync(id);
            if (ownerId == null) return Forbid();
            var result = await _appointmentService.RedirectAsync(id, dto, ownerId.Value);
            return Ok(ApiResponse<AppointmentResponseDto>.Ok(result, "Appointment redirected"));
        }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse<AppointmentResponseDto>.NotFound(ex.Message)); }
        catch (InvalidOperationException ex) { return BadRequest(ApiResponse<AppointmentResponseDto>.BadRequest(ex.Message)); }
    }

    [HttpPost("{id}/redirect-department")]
    [Authorize(Roles = "Admin,CEO")]
    public async Task<IActionResult> RedirectToDepartment(int id, [FromBody] AppointmentDepartmentRedirectDto dto)
    {
        try
        {
            var userId = User.GetUserId();
            var result = await _appointmentService.RedirectToDepartmentAsync(id, dto, userId);
            return Ok(ApiResponse<AppointmentResponseDto>.Ok(result, "Appointment redirected to department"));
        }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse<AppointmentResponseDto>.NotFound(ex.Message)); }
        catch (InvalidOperationException ex) { return BadRequest(ApiResponse<AppointmentResponseDto>.BadRequest(ex.Message)); }
    }

    [HttpPost("{id}/assign-employee")]
    [Authorize(Roles = "Admin,CEO,DepartmentHead")]
    public async Task<IActionResult> AssignEmployee(int id, [FromBody] AppointmentAssignDto dto)
    {
        try
        {
            if (User.GetRole() == "DepartmentHead")
            {
                var departmentId = await GetCurrentEmployeeDepartmentIdAsync();
                if (departmentId == null) return Forbid();

                var effectiveDepartmentId = await GetEffectiveDepartmentIdAsync(id);
                if (effectiveDepartmentId == null)
                    return NotFound(ApiResponse<AppointmentResponseDto>.NotFound("Appointment not found"));
                if (effectiveDepartmentId.Value != departmentId.Value)
                    return Forbid();

                var targetEmployee = await _context.Employees.FindAsync(dto.NewEmployeeId);
                if (targetEmployee == null)
                    return BadRequest(ApiResponse<AppointmentResponseDto>.BadRequest("Target employee not found"));
                if (targetEmployee.DepartmentId != departmentId.Value)
                    return Forbid();
            }

            var userId = User.GetUserId();
            var result = await _appointmentService.AssignEmployeeAsync(id, dto, userId);
            return Ok(ApiResponse<AppointmentResponseDto>.Ok(result, "Appointment assigned to employee"));
        }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse<AppointmentResponseDto>.NotFound(ex.Message)); }
        catch (InvalidOperationException ex) { return BadRequest(ApiResponse<AppointmentResponseDto>.BadRequest(ex.Message)); }
    }

    [HttpPatch("{id}/confidential")]
    public async Task<IActionResult> ToggleConfidential(int id)
    {
        try
        {
            var result = await _appointmentService.ToggleConfidentialAsync(id);
            return Ok(ApiResponse<AppointmentResponseDto>.Ok(result, "Confidential status toggled"));
        }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse<AppointmentResponseDto>.NotFound(ex.Message)); }
    }

    [HttpPost("{id}/reschedule")]
    public async Task<IActionResult> Reschedule(int id, [FromBody] RescheduleRequestDto dto)
    {
        try
        {
            var ownerId = await EnsureOwnershipAsync(id);
            if (ownerId == null) return Forbid();
            var result = await _appointmentService.RequestRescheduleAsync(id, dto, ownerId.Value);
            return Ok(ApiResponse<RescheduleResponseDto>.Ok(result, "Reschedule requested"));
        }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse<RescheduleResponseDto>.NotFound(ex.Message)); }
        catch (InvalidOperationException ex) { return BadRequest(ApiResponse<RescheduleResponseDto>.BadRequest(ex.Message)); }
    }

    [HttpGet("{id}/comments")]
    public async Task<IActionResult> GetComments(int id)
    {
        try
        {
            var result = await _appointmentService.GetCommentsAsync(id);
            return Ok(ApiResponse<IReadOnlyList<AppointmentCommentDto>>.Ok(result));
        }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse<IReadOnlyList<AppointmentCommentDto>>.NotFound(ex.Message)); }
    }

    [HttpPost("{id}/comments")]
    public async Task<IActionResult> AddComment(int id, [FromBody] AppointmentCommentCreateDto dto)
    {
        try
        {
            var userId = User.GetUserId();
            var result = await _appointmentService.AddCommentAsync(id, dto, userId);
            return Ok(ApiResponse<AppointmentCommentDto>.Ok(result, "Comment added"));
        }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse<AppointmentCommentDto>.NotFound(ex.Message)); }
    }

    [HttpGet("{id}/attachments")]
    public async Task<IActionResult> GetAttachments(int id)
    {
        try
        {
            var result = await _appointmentService.GetAttachmentsAsync(id);
            return Ok(ApiResponse<IReadOnlyList<AppointmentAttachmentDto>>.Ok(result));
        }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse<IReadOnlyList<AppointmentAttachmentDto>>.NotFound(ex.Message)); }
    }

    [HttpPost("{id}/attachments")]
    public async Task<IActionResult> UploadAttachment(int id, IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(ApiResponse<object>.BadRequest("No file provided"));

        try
        {
            var userId = User.GetUserId();
            var filePath = Path.Combine("uploads", "appointments", id.ToString(), file.FileName);
            Directory.CreateDirectory(Path.GetDirectoryName(filePath)!);
            using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream);
            var result = await _appointmentService.UploadAttachmentAsync(id, file.FileName, filePath, (int)file.Length, file.ContentType, userId);
            return Ok(ApiResponse<AppointmentAttachmentDto>.Ok(result, "Attachment uploaded"));
        }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse<AppointmentAttachmentDto>.NotFound(ex.Message)); }
    }

    [HttpDelete("{id}/attachments/{attachmentId}")]
    public async Task<IActionResult> DeleteAttachment(int id, int attachmentId)
    {
        try
        {
            await _appointmentService.DeleteAttachmentAsync(id, attachmentId);
            return Ok(ApiResponse<object>.Ok(null!, "Attachment deleted"));
        }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse<object>.NotFound(ex.Message)); }
    }

    [HttpGet("by-visitor/{visitorId}")]
    public async Task<IActionResult> GetByVisitor(int visitorId)
    {
        var callerVisitorId = User.GetVisitorId();
        if (callerVisitorId != null)
        {
            if (callerVisitorId.Value != visitorId)
                return Forbid();
            var visitorResult = await _appointmentService.GetByVisitorAsync(visitorId);
            return Ok(ApiResponse<IReadOnlyList<AppointmentResponseDto>>.Ok(visitorResult));
        }

        if (User.IsSuperAdmin())
        {
            var result = await _appointmentService.GetByVisitorAsync(visitorId);
            return Ok(ApiResponse<IReadOnlyList<AppointmentResponseDto>>.Ok(result));
        }

        var employeeId = User.GetEmployeeId();
        if (employeeId == null)
            return Forbid();

        if (!await HasRelationToVisitorAsync(employeeId.Value, visitorId))
            return Forbid();

        var empResult = await _appointmentService.GetByVisitorAsync(visitorId);
        return Ok(ApiResponse<IReadOnlyList<AppointmentResponseDto>>.Ok(empResult));
    }

    [HttpGet("by-employee/{employeeId}")]
    public async Task<IActionResult> GetByEmployee(int employeeId)
    {
        if (!User.IsAdminOrHigher())
        {
            var myEmployeeId = User.GetEmployeeId();
            if (myEmployeeId == null || myEmployeeId.Value != employeeId)
                return Forbid();
        }

        var result = await _appointmentService.GetByEmployeeAsync(employeeId);
        return Ok(ApiResponse<IReadOnlyList<AppointmentResponseDto>>.Ok(result));
    }

    [HttpGet("pending")]
    public async Task<IActionResult> GetPending()
    {
        if (User.IsSuperAdmin())
        {
            var result = await _appointmentService.GetPendingAsync();
            return Ok(ApiResponse<IReadOnlyList<AppointmentResponseDto>>.Ok(result));
        }

        if (User.GetRole() == "DepartmentHead")
        {
            var departmentId = await GetCurrentEmployeeDepartmentIdAsync();
            if (departmentId == null) return Forbid();

            var deptResult = await _appointmentService.GetPendingByDepartmentAsync(departmentId.Value);
            return Ok(ApiResponse<IReadOnlyList<AppointmentResponseDto>>.Ok(deptResult));
        }

        var employeeId = User.GetEmployeeId();
        if (employeeId == null)
            return Forbid();

        var empResult = await _appointmentService.GetPendingByEmployeeAsync(employeeId.Value);
        return Ok(ApiResponse<IReadOnlyList<AppointmentResponseDto>>.Ok(empResult));
    }

    [HttpGet("today")]
    public async Task<IActionResult> GetToday()
    {
        if (User.IsSuperAdmin())
        {
            var result = await _appointmentService.GetTodayAsync();
            return Ok(ApiResponse<IReadOnlyList<AppointmentResponseDto>>.Ok(result));
        }

        if (User.GetRole() == "DepartmentHead")
        {
            var departmentId = await GetCurrentEmployeeDepartmentIdAsync();
            if (departmentId == null) return Forbid();

            var deptResult = await _appointmentService.GetTodayByDepartmentAsync(departmentId.Value);
            return Ok(ApiResponse<IReadOnlyList<AppointmentResponseDto>>.Ok(deptResult));
        }

        var employeeId = User.GetEmployeeId();
        if (employeeId == null)
            return Forbid();

        var empResult = await _appointmentService.GetTodayByEmployeeAsync(employeeId.Value);
        return Ok(ApiResponse<IReadOnlyList<AppointmentResponseDto>>.Ok(empResult));
    }

    [HttpGet("by-department/{departmentId}")]
    [Authorize(Roles = "Admin,CEO,DepartmentHead")]
    public async Task<IActionResult> GetByDepartment(int departmentId)
    {
        if (User.GetRole() == "DepartmentHead")
        {
            var myDepartmentId = await GetCurrentEmployeeDepartmentIdAsync();
            if (myDepartmentId == null || myDepartmentId.Value != departmentId)
                return Forbid();
        }

        var result = await _appointmentService.GetByDepartmentAsync(departmentId);
        return Ok(ApiResponse<IReadOnlyList<AppointmentResponseDto>>.Ok(result));
    }

    [HttpGet("confidential")]
    [Authorize(Roles = "Admin,CEO,DepartmentHead")]
    public async Task<IActionResult> GetConfidential()
    {
        if (User.GetRole() == "DepartmentHead")
        {
            var departmentId = await GetCurrentEmployeeDepartmentIdAsync();
            if (departmentId == null) return Forbid();

            var deptResult = await _appointmentService.GetConfidentialByDepartmentAsync(departmentId.Value);
            return Ok(ApiResponse<IReadOnlyList<AppointmentResponseDto>>.Ok(deptResult));
        }

        var result = await _appointmentService.GetConfidentialAsync();
        return Ok(ApiResponse<IReadOnlyList<AppointmentResponseDto>>.Ok(result));
    }

    private async Task<int?> EnsureOwnershipAsync(int appointmentId)
    {
        if (User.IsSuperAdmin())
        {
            return User.GetUserId();
        }

        if (User.GetRole() == "DepartmentHead")
            return null;

        var employeeId = User.GetEmployeeId();
        if (employeeId == null) return null;

        var appointment = await _appointmentService.GetByIdAsync(appointmentId);
        if (appointment == null) return null;

        var id = employeeId.Value;
        var isAssigned = appointment.AssignedEmployeeId == id;
        var isLegacyHost = appointment.AssignedEmployeeId == null && appointment.EmployeeId == id;
        var isDelegated = appointment.DelegatedToEmployeeId == id;

        if (!isAssigned && !isLegacyHost && !isDelegated)
            return null;

        return User.GetUserId();
    }

    private async Task<bool> CanViewAppointmentAsync(AppointmentResponseDto appointment)
    {
        if (User.IsSuperAdmin())
            return true;

        var role = User.GetRole();
        var employeeId = User.GetEmployeeId();
        var visitorId = User.GetVisitorId();

        if (role == "Security" || role == "Receptionist")
            return true;

        if (role == "DepartmentHead")
        {
            if (employeeId == null)
                return false;
            var headDepartmentId = await GetCurrentEmployeeDepartmentIdAsync();
            if (headDepartmentId == null)
                return false;
            var effectiveDepartmentId = appointment.AssignedDepartmentId ?? appointment.DepartmentId;
            return effectiveDepartmentId == headDepartmentId.Value;
        }

        if (employeeId != null)
        {
            var id = employeeId.Value;
            return appointment.AssignedEmployeeId == id
                || appointment.DelegatedToEmployeeId == id
                || appointment.OriginalEmployeeId == id
                || (appointment.AssignedEmployeeId == null && appointment.EmployeeId == id);
        }

        if (visitorId != null)
            return appointment.VisitorId == visitorId.Value;

        return false;
    }

    private async Task<bool> HasRelationToVisitorAsync(int employeeId, int visitorId)
    {
        if (User.GetRole() == "DepartmentHead")
        {
            var departmentId = await GetCurrentEmployeeDepartmentIdAsync();
            if (departmentId == null) return false;

            return await _context.Appointments.AnyAsync(a =>
                a.VisitorId == visitorId &&
                (a.AssignedDepartmentId == departmentId.Value
                    || (a.AssignedDepartmentId == null && a.Employee.DepartmentId == departmentId.Value)));
        }

        return await _context.Appointments.AnyAsync(a =>
            a.VisitorId == visitorId &&
            (a.EmployeeId == employeeId
                || a.AssignedEmployeeId == employeeId
                || a.DelegatedToEmployeeId == employeeId
                || a.OriginalEmployeeId == employeeId));
    }

    private async Task<int?> GetCurrentEmployeeDepartmentIdAsync()
    {
        var employeeId = User.GetEmployeeId();
        if (employeeId == null) return null;
        var employee = await _context.Employees.FindAsync(employeeId.Value);
        return employee?.DepartmentId;
    }

    private async Task<int?> GetEffectiveDepartmentIdAsync(int appointmentId)
    {
        var appointment = await _context.Appointments
            .Include(a => a.Employee)
            .FirstOrDefaultAsync(a => a.Id == appointmentId);
        if (appointment == null) return null;
        return appointment.AssignedDepartmentId ?? appointment.Employee.DepartmentId;
    }
}
