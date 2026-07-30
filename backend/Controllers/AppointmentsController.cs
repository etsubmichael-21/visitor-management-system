using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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

    public AppointmentsController(IAppointmentService appointmentService) => _appointmentService = appointmentService;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] PageRequest request)
    {
        if (User.IsAdminOrHigher())
        {
            var result = await _appointmentService.GetAllAsync(request);
            return Ok(ApiResponse<PagedResponse<AppointmentResponseDto>>.Ok(result));
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
        var result = await _appointmentService.GetByIdAsync(id);
        if (result == null) return NotFound(ApiResponse<AppointmentResponseDto>.NotFound("Appointment not found"));
        return Ok(ApiResponse<AppointmentResponseDto>.Ok(result));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] AppointmentCreateDto dto)
    {
        var result = await _appointmentService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<AppointmentResponseDto>.Created(result));
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
        var result = await _appointmentService.GetByVisitorAsync(visitorId);
        return Ok(ApiResponse<IReadOnlyList<AppointmentResponseDto>>.Ok(result));
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
        if (User.IsAdminOrHigher())
        {
            var result = await _appointmentService.GetPendingAsync();
            return Ok(ApiResponse<IReadOnlyList<AppointmentResponseDto>>.Ok(result));
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
        if (User.IsAdminOrHigher())
        {
            var result = await _appointmentService.GetTodayAsync();
            return Ok(ApiResponse<IReadOnlyList<AppointmentResponseDto>>.Ok(result));
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
        var result = await _appointmentService.GetByDepartmentAsync(departmentId);
        return Ok(ApiResponse<IReadOnlyList<AppointmentResponseDto>>.Ok(result));
    }

    [HttpGet("confidential")]
    [Authorize(Roles = "Admin,CEO,DepartmentHead")]
    public async Task<IActionResult> GetConfidential()
    {
        var result = await _appointmentService.GetConfidentialAsync();
        return Ok(ApiResponse<IReadOnlyList<AppointmentResponseDto>>.Ok(result));
    }

    private async Task<int?> EnsureOwnershipAsync(int appointmentId)
    {
        if (User.IsAdminOrHigher())
        {
            var userId = User.GetUserId();
            return userId;
        }

        var employeeId = User.GetEmployeeId();
        if (employeeId == null) return null;

        var appointment = await _appointmentService.GetByIdAsync(appointmentId);
        if (appointment == null) return null;

        if (appointment.EmployeeId != employeeId.Value)
            return null;

        return User.GetUserId();
    }
}
