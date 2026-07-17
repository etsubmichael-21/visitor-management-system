namespace EcxVisitorManagement.DTOs.Employees;

public class EmployeeCreateDto
{
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public int DepartmentId { get; set; }
    public string Position { get; set; } = string.Empty;
    public string? OfficeNumber { get; set; }
}

public class EmployeeUpdateDto
{
    public string? FullName { get; set; }
    public string? Phone { get; set; }
    public string? DepartmentId { get; set; }
    public string? Position { get; set; }
    public string? OfficeNumber { get; set; }
    public string? Status { get; set; }
}

public class EmployeeResponseDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public int DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public string? OfficeNumber { get; set; }
    public string Status { get; set; } = string.Empty;
    public int? UserId { get; set; }
    public int PendingAppointments { get; set; }
    public int TotalAppointments { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public class EmployeeScheduleDto
{
    public int Id { get; set; }
    public string DayOfWeek { get; set; } = string.Empty;
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public TimeOnly? BreakStart { get; set; }
    public TimeOnly? BreakEnd { get; set; }
    public bool IsAvailable { get; set; }
    public int MaxAppointments { get; set; }
    public string? Notes { get; set; }
}

public class EmployeeScheduleUpdateDto
{
    public List<EmployeeScheduleDto> Schedules { get; set; } = new();
}

public class EmployeeUnavailabilityCreateDto
{
    public int EmployeeId { get; set; }
    public string UnavailabilityType { get; set; } = string.Empty;
    public DateOnly StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public string? Reason { get; set; }
}

public class EmployeeUnavailabilityResponseDto
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string UnavailabilityType { get; set; } = string.Empty;
    public DateOnly StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public string? Reason { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
