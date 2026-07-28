using System.Net;
using System.Net.Mail;
using System.Text;
using Microsoft.EntityFrameworkCore;
using EcxVisitorManagement.Data;
using EcxVisitorManagement.Models;

namespace EcxVisitorManagement.BackgroundServices;

public class EmailQueueProcessor : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<EmailQueueProcessor> _logger;
    private readonly IConfiguration _configuration;

    public EmailQueueProcessor(IServiceProvider serviceProvider, ILogger<EmailQueueProcessor> logger, IConfiguration configuration)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _configuration = configuration;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Email Queue Processor started");

        var smtpHost = _configuration["Smtp:Host"] ?? "smtp.gmail.com";
        var smtpPort = int.TryParse(_configuration["Smtp:Port"], out var port) ? port : 587;
        var smtpEnableSsl = bool.TryParse(_configuration["Smtp:EnableSsl"], out var ssl) ? ssl : true;
        var smtpUsername = _configuration["Smtp:Username"] ?? "";
        var smtpPassword = _configuration["Smtp:Password"] ?? "";
        var fromAddress = _configuration["Smtp:FromAddress"] ?? "noreply@ecx.com.et";
        var fromName = _configuration["Smtp:FromName"] ?? "ECX Visitor Management";

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

                if (pendingEmails.Count == 0)
                {
                    await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
                    continue;
                }

                var canSendViaSmtp = !string.IsNullOrWhiteSpace(smtpUsername) && !string.IsNullOrWhiteSpace(smtpPassword);

                SmtpClient? client = null;
                if (canSendViaSmtp)
                {
                    client = new SmtpClient(smtpHost, smtpPort)
                    {
                        EnableSsl = smtpEnableSsl,
                        Credentials = new NetworkCredential(smtpUsername, smtpPassword),
                        Timeout = 30000
                    };
                }

                try
                {
                    foreach (var email in pendingEmails)
                    {
                        try
                        {
                            if (client != null)
                            {
                                using var message = new MailMessage
                                {
                                    From = new MailAddress(fromAddress, fromName, Encoding.UTF8),
                                    Subject = email.Subject,
                                    Body = email.Body,
                                    IsBodyHtml = true,
                                    SubjectEncoding = Encoding.UTF8,
                                    BodyEncoding = Encoding.UTF8
                                };
                                message.To.Add(email.RecipientEmail);
                                await client.SendMailAsync(message);
                            }

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
                finally
                {
                    client?.Dispose();
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
