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
    public string? Notes { get; set; }
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
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string EmployeePosition { get; set; } = string.Empty;
    public string DepartmentName { get; set; } = string.Empty;
    public DateOnly RequestedDate { get; set; }
    public DateTimeOffset RequestedStartTime { get; set; }
    public DateTimeOffset RequestedEndTime { get; set; }
    public string Purpose { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset? EmployeeResponse { get; set; }
    public DateTimeOffset? ApprovalDate { get; set; }
    public bool CheckInAllowed { get; set; }
    public bool IsConfidential { get; set; }
    public string? AppointmentCode { get; set; }
    public string? RejectionReason { get; set; }
    public string? Notes { get; set; }
    public int? DelegatedToEmployeeId { get; set; }
    public string? DelegatedToEmployeeName { get; set; }
    public int? OriginalEmployeeId { get; set; }
    public string? OriginalEmployeeName { get; set; }
    public List<AppointmentAttachmentDto> Attachments { get; set; } = new();
    public int CommentCount { get; set; }
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
