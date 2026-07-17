namespace EcxVisitorManagement.DTOs.Notifications;

public class NotificationResponseDto
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public int? AppointmentId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string NotificationType { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTimeOffset? ReadAt { get; set; }
    public string Channel { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
}

public class VisitorNotificationResponseDto
{
    public int Id { get; set; }
    public int VisitorId { get; set; }
    public int? AppointmentId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string NotificationType { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTimeOffset? ReadAt { get; set; }
    public string Channel { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
}

public class UnreadCountDto
{
    public int Count { get; set; }
}
