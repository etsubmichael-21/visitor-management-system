namespace EcxVisitorManagement.DTOs.Users;

public class UserCreateDto
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Role { get; set; } = "Employee";
    public int? EmployeeId { get; set; }
}

public class UserUpdateDto
{
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public string? Role { get; set; }
    public bool? IsActive { get; set; }
}

public class UserResponseDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public int? EmployeeId { get; set; }
    public string? EmployeeName { get; set; }
    public int? VisitorId { get; set; }
    public string? VisitorName { get; set; }
    public DateTimeOffset? LastLogin { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
