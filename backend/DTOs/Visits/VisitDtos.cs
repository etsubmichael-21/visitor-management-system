using EcxVisitorManagement.DTOs.Appointments;

namespace EcxVisitorManagement.DTOs.Visits;

public class VisitCreateDto
{
    public int VisitorId { get; set; }
    public int EmployeeId { get; set; }
    public int? AppointmentId { get; set; }
    public string Purpose { get; set; } = string.Empty;
    public bool IsDestinationKnown { get; set; } = true;
    public string? Remark { get; set; }
}

public class CheckInRequest
{
    public int VisitorId { get; set; }
    public int EmployeeId { get; set; }
    public int? AppointmentId { get; set; }
    public string Purpose { get; set; } = string.Empty;
    public string SecurityOfficer { get; set; } = string.Empty;
    public bool IsDestinationKnown { get; set; } = true;
    public string? BadgeNumber { get; set; }
}

public class CheckOutRequest
{
    public string SecurityOfficer { get; set; } = string.Empty;
    public string? Remark { get; set; }
}

public class VisitResponseDto
{
    public int Id { get; set; }
    public int VisitorId { get; set; }
    public string VisitorName { get; set; } = string.Empty;
    public string VisitorPhone { get; set; } = string.Empty;
    public string VisitorEmail { get; set; } = string.Empty;
    public string? VisitorPhotoUrl { get; set; }
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string DepartmentName { get; set; } = string.Empty;
    public int? AppointmentId { get; set; }
    public AppointmentResponseDto? Appointment { get; set; }
    public string Purpose { get; set; } = string.Empty;
    public DateOnly VisitDate { get; set; }
    public DateTimeOffset? CheckInTime { get; set; }
    public DateTimeOffset? CheckOutTime { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? BadgeNumber { get; set; }
    public string? SecurityOfficer { get; set; }
    public string? Remark { get; set; }
    public bool IsDestinationKnown { get; set; }
    public string? RedirectNote { get; set; }
    public List<VisitorItemDto> VisitorItems { get; set; } = new();
    public bool AllItemsVerified { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public class VisitorItemDto
{
    public int Id { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string? SerialNumber { get; set; }
    public string? Brand { get; set; }
    public string? Description { get; set; }
    public bool IsVerified { get; set; }
    public DateTimeOffset? VerifiedAt { get; set; }
}

public class VisitorItemCreateDto
{
    public string ItemName { get; set; } = string.Empty;
    public int Quantity { get; set; } = 1;
    public string? SerialNumber { get; set; }
    public string? Brand { get; set; }
    public string? Description { get; set; }
}

public class ItemVerificationDto
{
    public int ItemId { get; set; }
    public bool IsVerified { get; set; }
}
