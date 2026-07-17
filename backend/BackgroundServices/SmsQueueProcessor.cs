using Microsoft.EntityFrameworkCore;
using EcxVisitorManagement.Data;
using EcxVisitorManagement.Models;

namespace EcxVisitorManagement.BackgroundServices;

public class SmsQueueProcessor : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<SmsQueueProcessor> _logger;

    public SmsQueueProcessor(IServiceProvider serviceProvider, ILogger<SmsQueueProcessor> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("SMS Queue Processor started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                var pendingSms = await context.SmsQueues
                    .Where(s => s.Status == "Pending" && s.RetryCount < 10)
                    .OrderBy(s => s.CreatedAt)
                    .Take(20)
                    .ToListAsync(stoppingToken);

                foreach (var sms in pendingSms)
                {
                    try
                    {
                        sms.Status = "Sent";
                        sms.SentAt = DateTimeOffset.UtcNow;
                        await context.SaveChangesAsync(stoppingToken);
                        _logger.LogInformation("SMS sent to {Phone}", sms.RecipientPhone);
                    }
                    catch (Exception ex)
                    {
                        sms.RetryCount++;
                        sms.ErrorMessage = ex.Message;
                        if (sms.RetryCount >= 10) sms.Status = "Failed";
                        await context.SaveChangesAsync(stoppingToken);
                        _logger.LogWarning(ex, "Failed to send SMS to {Phone}, retry {Count}", sms.RecipientPhone, sms.RetryCount);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing SMS queue");
            }

            await Task.Delay(TimeSpan.FromSeconds(60), stoppingToken);
        }
    }
}
