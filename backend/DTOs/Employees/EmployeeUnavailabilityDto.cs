namespace EcxVisitorManagement.DTOs.Employees;

public class EmployeeUnavailabilityDto
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string UnavailabilityType { get; set; } = string.Empty;
    public DateOnly StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public TimeOnly? StartTime { get; set; }
    public TimeOnly? EndTime { get; set; }
    public string? Repeat { get; set; }
    public string? Reason { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
}

public class CreateEmployeeUnavailabilityDto
{
    public int EmployeeId { get; set; }
    public string UnavailabilityType { get; set; } = "Other";
    public DateOnly StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public TimeOnly? StartTime { get; set; }
    public TimeOnly? EndTime { get; set; }
    public string? Repeat { get; set; }
    public string? Reason { get; set; }
}

public class UpdateEmployeeUnavailabilityDto
{
    public string UnavailabilityType { get; set; } = "Other";
    public DateOnly StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public TimeOnly? StartTime { get; set; }
    public TimeOnly? EndTime { get; set; }
    public string? Repeat { get; set; }
    public string? Reason { get; set; }
}
