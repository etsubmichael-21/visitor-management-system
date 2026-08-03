using System.Net;
using System.Net.Mail;
using System.Net.Sockets;
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

    private const int SmtpTimeoutSeconds = 10;
    private const int ConnectivityTimeoutMs = 5000;

    public EmailQueueProcessor(IServiceProvider serviceProvider, ILogger<EmailQueueProcessor> logger, IConfiguration configuration)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _configuration = configuration;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("EmailQueueProcessor started");

        var smtpHost = _configuration["Smtp:Host"] ?? "smtp.gmail.com";
        var smtpPort = int.TryParse(_configuration["Smtp:Port"], out var port) ? port : 465;
        var smtpEnableSsl = bool.TryParse(_configuration["Smtp:EnableSsl"], out var ssl) ? ssl : true;
        var smtpUsername = _configuration["Smtp:Username"] ?? "";
        var smtpPassword = _configuration["Smtp:Password"] ?? "";
        var fromAddress = _configuration["Smtp:FromAddress"] ?? "noreply@ecx.com.et";
        var fromName = _configuration["Smtp:FromName"] ?? "ECX Visitor Management";

        var canSendViaSmtp = !string.IsNullOrWhiteSpace(smtpUsername) && !string.IsNullOrWhiteSpace(smtpPassword);
        if (!canSendViaSmtp)
            _logger.LogWarning("SMTP credentials not configured in appsettings.json. Emails will be queued but not sent.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                var pendingEmails = await context.EmailQueues
                    .Where(e => (e.Status == EmailQueue.StatusPending || e.Status == EmailQueue.StatusFailed) && e.RetryCount < EmailQueue.MaxRetryCount)
                    .OrderBy(e => e.CreatedAt)
                    .Take(20)
                    .ToListAsync(stoppingToken);

                if (pendingEmails.Count == 0)
                {
                    await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
                    continue;
                }

                if (!canSendViaSmtp)
                {
                    _logger.LogWarning("Skipping {Count} queued emails — SMTP not configured", pendingEmails.Count);
                    await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
                    continue;
                }

                if (!await SmtpServerIsReachableAsync(smtpHost, smtpPort, stoppingToken))
                {
                    _logger.LogWarning("SMTP server {Host}:{Port} is unreachable. Skipping {Count} queued emails this cycle.",
                        smtpHost, smtpPort, pendingEmails.Count);
                    await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
                    continue;
                }

                using var client = new SmtpClient(smtpHost, smtpPort)
                {
                    EnableSsl = smtpEnableSsl,
                    Credentials = new NetworkCredential(smtpUsername, smtpPassword),
                    Timeout = SmtpTimeoutSeconds * 1000
                };

                foreach (var email in pendingEmails)
                {
                    try
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

                        email.Status = EmailQueue.StatusSent;
                        email.SentAt = DateTimeOffset.UtcNow;
                        email.ErrorMessage = null;
                        await context.SaveChangesAsync(stoppingToken);
                        _logger.LogInformation("Email sent to {Email}: {Subject}", email.RecipientEmail, email.Subject);
                    }
                    catch (Exception ex)
                    {
                        email.RetryCount++;
                        email.ErrorMessage = ex.Message;
                        email.Status = email.RetryCount >= EmailQueue.MaxRetryCount
                            ? EmailQueue.StatusPermanentlyFailed
                            : EmailQueue.StatusFailed;
                        await context.SaveChangesAsync(stoppingToken);

                        if (email.RetryCount >= EmailQueue.MaxRetryCount)
                            _logger.LogError(ex, "Email to {Email} permanently failed after {RetryCount} attempts: {Subject}",
                                email.RecipientEmail, email.RetryCount, email.Subject);
                        else
                            _logger.LogWarning(ex, "Email to {Email} failed (attempt {RetryCount}/{MaxRetryCount}): {Subject}",
                                email.RecipientEmail, email.RetryCount, EmailQueue.MaxRetryCount, email.Subject);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in EmailQueueProcessor cycle");
            }

            await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
        }
    }

    private static async Task<bool> SmtpServerIsReachableAsync(string host, int port, CancellationToken ct)
    {
        try
        {
            using var tcpClient = new TcpClient();
            var connectTask = tcpClient.ConnectAsync(host, port);
            if (await Task.WhenAny(connectTask, Task.Delay(ConnectivityTimeoutMs, ct)) == connectTask)
            {
                if (connectTask.IsCompletedSuccessfully)
                    return true;
            }
            return false;
        }
        catch
        {
            return false;
        }
    }
}
