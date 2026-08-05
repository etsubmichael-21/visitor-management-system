using Microsoft.AspNetCore.Http;

namespace EcxVisitorManagement.DTOs.Appointments;

public class AppointmentCreateDto
{
    public int VisitorId { get; set; }
    public int EmployeeId { get; set; }
    public DateOnly RequestedDate { get; set; }
    public DateTimeOffset RequestedStartTime { get; set; }
    public DateTimeOffset RequestedEndTime { get; set; }
    public string Purpose { get; set; } = string.Empty;
    public bool IsConfidential { get; set; }
    public string? RouteType { get; set; }
    public string? AppointmentMethod { get; set; }
    public string? Notes { get; set; }
    public IFormFile? SupportingLetter { get; set; }
    public bool HasProperties { get; set; }
    public List<AppointmentPropertyCreateDto>? Properties { get; set; }
    public IFormFile? PropertyAuthorizationLetter { get; set; }
}

public class AppointmentUpdateDto
{
    public DateOnly? RequestedDate { get; set; }
    public DateTimeOffset? RequestedStartTime { get; set; }
    public DateTimeOffset? RequestedEndTime { get; set; }
    public string? Purpose { get; set; }
    public string? Notes { get; set; }
}

public class AppointmentResponseDto
{
    public int Id { get; set; }
    public int VisitorId { get; set; }
    public string VisitorName { get; set; } = string.Empty;
    public string VisitorEmail { get; set; } = string.Empty;
    public string VisitorPhone { get; set; } = string.Empty;
    public string? VisitorCompany { get; set; }
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string EmployeePosition { get; set; } = string.Empty;
    public int DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public DateOnly RequestedDate { get; set; }
    public DateTimeOffset RequestedStartTime { get; set; }
    public DateTimeOffset RequestedEndTime { get; set; }
    public string Purpose { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset? EmployeeResponse { get; set; }
    public DateTimeOffset? ApprovalDate { get; set; }
    public bool CheckInAllowed { get; set; }
    public DateTimeOffset? VisitCheckInTime { get; set; }
    public DateTimeOffset? VisitCheckOutTime { get; set; }
    public string? BadgeNumber { get; set; }
    public bool IsConfidential { get; set; }
    public string? RouteType { get; set; }
    public string? AppointmentMethod { get; set; }
    public string? AppointmentCode { get; set; }
    public string? RejectionReason { get; set; }
    public string? Notes { get; set; }
    public SupportingLetterDto? SupportingLetter { get; set; }
    public int? DelegatedToEmployeeId { get; set; }
    public string? DelegatedToEmployeeName { get; set; }
    public int? OriginalEmployeeId { get; set; }
    public string? OriginalEmployeeName { get; set; }
    public int? AssignedDepartmentId { get; set; }
    public string? AssignedDepartmentName { get; set; }
    public int? AssignedEmployeeId { get; set; }
    public string? AssignedEmployeeName { get; set; }
    public int? RedirectedFromDepartmentId { get; set; }
    public string? RedirectedFromDepartmentName { get; set; }
    public string? RedirectReason { get; set; }
    public int? AssignedBy { get; set; }
    public DateTimeOffset? AssignedAt { get; set; }
    public List<AppointmentAttachmentDto> Attachments { get; set; } = new();
    public int CommentCount { get; set; }
    public List<AppointmentPropertyDto> Properties { get; set; } = new();
    public PropertyAuthorizationLetterDto? PropertyAuthorizationLetter { get; set; }
    public bool HasProperties { get; set; }
    public bool AllPropertiesVerified { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
}

public class AppointmentDelegateDto
{
    public int NewEmployeeId { get; set; }
    public string? Reason { get; set; }
}

public class AppointmentRedirectDto
{
    public int NewEmployeeId { get; set; }
    public int? NewDepartmentId { get; set; }
    public string? Reason { get; set; }
}

public class AppointmentDepartmentRedirectDto
{
    public int NewDepartmentId { get; set; }
    public string? Reason { get; set; }
}

public class AppointmentAssignDto
{
    public int NewEmployeeId { get; set; }
    public string? Notes { get; set; }
}

public class AppointmentRejectDto
{
    public string Reason { get; set; } = string.Empty;
}

public class RescheduleRequestDto
{
    public DateOnly NewDate { get; set; }
    public DateTimeOffset NewStartTime { get; set; }
    public DateTimeOffset NewEndTime { get; set; }
    public string? Reason { get; set; }
}

public class RescheduleResponseDto
{
    public int Id { get; set; }
    public int AppointmentId { get; set; }
    public string RequestedByUserName { get; set; } = string.Empty;
    public DateOnly NewDate { get; set; }
    public DateTimeOffset NewStartTime { get; set; }
    public DateTimeOffset NewEndTime { get; set; }
    public string? Reason { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
}

public class AppointmentAttachmentDto
{
    public int Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public int FileSize { get; set; }
    public string ContentType { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
}

public class SupportingLetterDto
{
    public string FileName { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string ContentType { get; set; } = string.Empty;
    public DateTimeOffset? UploadedAt { get; set; }
}

public class PropertyAuthorizationLetterDto
{
    public string FileName { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string ContentType { get; set; } = string.Empty;
    public DateTimeOffset? UploadedAt { get; set; }
}

public class AppointmentPropertyCreateDto
{
    public string? PropertyName { get; set; }
    public string? PropertyType { get; set; }
    public string? Brand { get; set; }
    public string? Model { get; set; }
    public string? SerialNumber { get; set; }
    public string? AssetTagNumber { get; set; }
    public int Quantity { get; set; } = 1;
    public string? Description { get; set; }
}

public class AppointmentPropertyDto
{
    public int Id { get; set; }
    public string? PropertyName { get; set; }
    public string PropertyType { get; set; } = string.Empty;
    public string? Brand { get; set; }
    public string? Model { get; set; }
    public string? SerialNumber { get; set; }
    public string? AssetTagNumber { get; set; }
    public int Quantity { get; set; }
    public string? Description { get; set; }
    public bool IsVerified { get; set; }
    public string? VerificationStatus { get; set; }
    public DateTimeOffset? VerifiedAt { get; set; }
    public string? VerifiedByUserName { get; set; }
}

public class PropertyVerificationItemDto
{
    public int? Id { get; set; }
    public string PropertyType { get; set; } = string.Empty;
    public string? PropertyName { get; set; }
    public string? Brand { get; set; }
    public string? Model { get; set; }
    public string? SerialNumber { get; set; }
    public int Quantity { get; set; } = 1;
    public string VerificationStatus { get; set; } = string.Empty;
}

public class SavePropertyVerificationDto
{
    public List<PropertyVerificationItemDto> Items { get; set; } = new();
}

public class VerifyAppointmentPropertiesDto
{
    public List<int> PropertyIds { get; set; } = new();
}

public class SupportingLetterDownloadDto
{
    public string FullPath { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
}

public class AppointmentCommentDto
{
    public int Id { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string UserRole { get; set; } = string.Empty;
    public string CommentText { get; set; } = string.Empty;
    public bool IsInternal { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public class AppointmentCommentCreateDto
{
    public string CommentText { get; set; } = string.Empty;
    public bool IsInternal { get; set; }
}
