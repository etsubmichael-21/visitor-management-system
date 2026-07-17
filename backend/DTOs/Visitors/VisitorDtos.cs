namespace EcxVisitorManagement.DTOs.Visitors;

public class VisitorCreateDto
{
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string? NationalId { get; set; }
    public string? Organization { get; set; }
    public string? Gender { get; set; }
}

public class VisitorUpdateDto
{
    public string? FullName { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? Organization { get; set; }
    public string? Gender { get; set; }
}

public class VisitorResponseDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string? NationalId { get; set; }
    public string? Organization { get; set; }
    public string? Gender { get; set; }
    public string? PhotoUrl { get; set; }
    public bool IsActive { get; set; }
    public int TotalVisits { get; set; }
    public int TotalAppointments { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
