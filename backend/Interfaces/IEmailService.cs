namespace EcxVisitorManagement.Interfaces;

public interface IEmailService
{
    Task SendAsync(string toEmail, string subject, string body, CancellationToken ct = default);
    Task SendAppointmentNotificationAsync(string toEmail, string visitorName, string employeeName, DateOnly date, string status, string? reason = null, CancellationToken ct = default);
}

public interface ISmsService
{
    Task SendAsync(string phoneNumber, string message, CancellationToken ct = default);
    Task SendAppointmentNotificationAsync(string phoneNumber, string visitorName, string employeeName, DateOnly date, string status, string? reason = null, CancellationToken ct = default);
}
