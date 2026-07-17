using Microsoft.EntityFrameworkCore;
using EcxVisitorManagement.Data;
using EcxVisitorManagement.Models;

namespace EcxVisitorManagement.BackgroundServices;

public class EmailQueueProcessor : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<EmailQueueProcessor> _logger;

    public EmailQueueProcessor(IServiceProvider serviceProvider, ILogger<EmailQueueProcessor> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Email Queue Processor started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                var pendingEmails = await context.EmailQueues
                    .Where(e => e.Status == "Pending" && e.RetryCount < 10)
                    .OrderBy(e => e.CreatedAt)
                    .Take(20)
                    .ToListAsync(stoppingToken);

                foreach (var email in pendingEmails)
                {
                    try
                    {
                        email.Status = "Sent";
                        email.SentAt = DateTimeOffset.UtcNow;
                        await context.SaveChangesAsync(stoppingToken);
                        _logger.LogInformation("Email sent to {Email}: {Subject}", email.RecipientEmail, email.Subject);
                    }
                    catch (Exception ex)
                    {
                        email.RetryCount++;
                        email.ErrorMessage = ex.Message;
                        if (email.RetryCount >= 10) email.Status = "Failed";
                        await context.SaveChangesAsync(stoppingToken);
                        _logger.LogWarning(ex, "Failed to send email to {Email}, retry {Count}", email.RecipientEmail, email.RetryCount);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing email queue");
            }

            await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
        }
    }
}
