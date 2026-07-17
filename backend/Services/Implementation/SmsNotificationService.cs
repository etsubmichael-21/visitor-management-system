using Microsoft.EntityFrameworkCore;
using EcxVisitorManagement.Data;
using EcxVisitorManagement.Models;

namespace EcxVisitorManagement.Services.Implementation;

public class SmsNotificationService : Interfaces.ISmsService
{
    private readonly AppDbContext _context;
    private readonly ILogger<SmsNotificationService> _logger;

    public SmsNotificationService(AppDbContext context, ILogger<SmsNotificationService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task SendAsync(string phoneNumber, string message, CancellationToken ct = default)
    {
        var queue = new SmsQueue
        {
            RecipientPhone = phoneNumber,
            Message = message,
            Status = "Pending",
            CreatedAt = DateTimeOffset.UtcNow
        };
        _context.SmsQueues.Add(queue);
        await _context.SaveChangesAsync(ct);
        _logger.LogInformation("SMS queued for {Phone}: {Message}", phoneNumber, message[..Math.Min(50, message.Length)]);
    }

    public async Task SendAppointmentNotificationAsync(string phoneNumber, string visitorName, string employeeName, DateOnly date, string status, string? reason = null, CancellationToken ct = default)
    {
        var message = status switch
        {
            "Submitted" => $"ECX VMS: Your appointment request with {employeeName} on {date:MMM dd, yyyy} has been received and is under review.",
            "Approved" => $"ECX VMS: Your appointment with {employeeName} on {date:MMM dd, yyyy} has been approved. Please arrive on time.",
            "Rejected" => $"ECX VMS: Your appointment with {employeeName} on {date:MMM dd, yyyy} has been rejected." + (string.IsNullOrEmpty(reason) ? "" : $" Reason: {reason}"),
            "Cancelled" => $"ECX VMS: Your appointment with {employeeName} on {date:MMM dd, yyyy} has been cancelled.",
            _ => $"ECX VMS: Your appointment status has been updated to: {status}."
        };

        await SendAsync(phoneNumber, message, ct);
    }
}
