using System.Net;
using System.Net.Mail;
using Microsoft.EntityFrameworkCore;
using EcxVisitorManagement.Data;
using EcxVisitorManagement.Models;

namespace EcxVisitorManagement.Services.Implementation;

public class EmailNotificationService : Interfaces.IEmailService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailNotificationService> _logger;

    public EmailNotificationService(AppDbContext context, IConfiguration configuration, ILogger<EmailNotificationService> logger)
    {
        _context = context;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendAsync(string toEmail, string subject, string body, CancellationToken ct = default)
    {
        var queue = new EmailQueue
        {
            RecipientEmail = toEmail,
            Subject = subject,
            Body = body,
            Status = "Pending",
            CreatedAt = DateTimeOffset.UtcNow
        };
        _context.EmailQueues.Add(queue);
        await _context.SaveChangesAsync(ct);
        _logger.LogInformation("Email queued for {Email}: {Subject}", toEmail, subject);
    }

    public async Task SendAppointmentNotificationAsync(string toEmail, string visitorName, string employeeName, DateOnly date, string status, string? reason = null, CancellationToken ct = default)
    {
        var (subject, body) = status switch
        {
            "Submitted" => (
                "Appointment Request Received",
                $"Dear visitor,<br/><br/>Your appointment request with <strong>{employeeName}</strong> on <strong>{date:MMMM dd, yyyy}</strong> has been received and is under review. You will be notified once it is approved or rejected.<br/><br/>Thank you,<br/>ECX Visitor Management"
            ),
            "Approved" => (
                "Appointment Approved",
                $"Dear visitor,<br/><br/>Your appointment with <strong>{employeeName}</strong> on <strong>{date:MMMM dd, yyyy}</strong> has been <strong>approved</strong>. Please arrive on time.<br/><br/>Thank you,<br/>ECX Visitor Management"
            ),
            "Rejected" => (
                "Appointment Rejected",
                $"Dear visitor,<br/><br/>Your appointment with <strong>{employeeName}</strong> on <strong>{date:MMMM dd, yyyy}</strong> has been <strong>rejected</strong>." +
                (string.IsNullOrEmpty(reason) ? "" : $" Reason: {reason}") +
                $"<br/><br/>Thank you,<br/>ECX Visitor Management"
            ),
            "Cancelled" => (
                "Appointment Cancelled",
                $"Dear visitor,<br/><br/>Your appointment with <strong>{employeeName}</strong> on <strong>{date:MMMM dd, yyyy}</strong> has been <strong>cancelled</strong>.<br/><br/>Thank you,<br/>ECX Visitor Management"
            ),
            _ => ("Appointment Update", $"Your appointment status has been updated to: {status}.")
        };

        await SendAsync(toEmail, subject, body, ct);
    }
}
