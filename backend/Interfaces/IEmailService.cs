namespace EcxVisitorManagement.Interfaces;

public interface IEmailService
{
    Task SendAsync(string toEmail, string subject, string htmlBody, CancellationToken ct = default);

    Task SendAppointmentSubmittedAsync(string toEmail, string visitorName, string employeeName, string department, DateOnly date, DateTimeOffset startTime, DateTimeOffset endTime, string purpose, string? notes, CancellationToken ct = default);

    Task SendAppointmentApprovedAsync(string toEmail, string visitorName, string employeeName, string department, DateOnly date, DateTimeOffset startTime, DateTimeOffset endTime, string purpose, string? notes, CancellationToken ct = default);

    Task SendAppointmentRejectedAsync(string toEmail, string visitorName, string employeeName, string department, DateOnly date, DateTimeOffset startTime, DateTimeOffset endTime, string purpose, string? rejectionReason, CancellationToken ct = default);

    Task SendAppointmentCancelledAsync(string toEmail, string visitorName, string employeeName, string department, DateOnly date, DateTimeOffset startTime, DateTimeOffset endTime, string purpose, CancellationToken ct = default);

    Task SendAppointmentRescheduledAsync(string toEmail, string visitorName, string employeeName, string department, DateOnly oldDate, DateOnly newDate, DateTimeOffset newStartTime, DateTimeOffset newEndTime, string purpose, string? reason, CancellationToken ct = default);

    Task SendAppointmentReminderAsync(string toEmail, string visitorName, string employeeName, string department, DateOnly date, DateTimeOffset startTime, DateTimeOffset endTime, string purpose, CancellationToken ct = default);

    Task SendWelcomeEmailAsync(string toEmail, string fullName, CancellationToken ct = default);

    Task SendPasswordResetEmailAsync(string toEmail, string resetToken, string baseUrl, CancellationToken ct = default);

    Task SendPasswordChangedEmailAsync(string toEmail, string fullName, CancellationToken ct = default);

    Task SendEmployeeWelcomeEmailAsync(string toEmail, string employeeName, CancellationToken ct = default);

    Task SendEmployeeNewRequestAsync(string toEmail, string employeeName, string visitorName, string department, DateOnly date, DateTimeOffset startTime, DateTimeOffset endTime, string purpose, string? notes, bool hasSupportingLetter = false, CancellationToken ct = default);

    Task SendEmployeeRequestCancelledAsync(string toEmail, string employeeName, string visitorName, string department, DateOnly date, DateTimeOffset startTime, DateTimeOffset endTime, string purpose, CancellationToken ct = default);

    Task SendEmployeeRequestRescheduledAsync(string toEmail, string employeeName, string visitorName, string department, DateOnly oldDate, DateOnly newDate, DateTimeOffset newStartTime, DateTimeOffset newEndTime, string purpose, string? reason, CancellationToken ct = default);

    Task SendEmployeeReminderAsync(string toEmail, string employeeName, string visitorName, string department, DateOnly date, DateTimeOffset startTime, DateTimeOffset endTime, string purpose, CancellationToken ct = default);
}

public interface ISmsService
{
    Task SendAsync(string phoneNumber, string message, CancellationToken ct = default);
    Task SendAppointmentNotificationAsync(string phoneNumber, string visitorName, string employeeName, DateOnly date, string status, string? reason = null, CancellationToken ct = default);
}
