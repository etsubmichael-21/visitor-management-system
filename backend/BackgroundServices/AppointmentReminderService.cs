using Microsoft.EntityFrameworkCore;
using EcxVisitorManagement.Data;
using EcxVisitorManagement.Models;

namespace EcxVisitorManagement.BackgroundServices;

public class AppointmentReminderService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<AppointmentReminderService> _logger;

    public AppointmentReminderService(IServiceProvider serviceProvider, ILogger<AppointmentReminderService> _logger)
    {
        _serviceProvider = serviceProvider;
        this._logger = _logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Appointment Reminder Service started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                var tomorrow = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));
                var pendingReminders = await context.Appointments
                    .Where(a => a.RequestedDate == tomorrow && a.Status == "Approved" && !a.ReminderEmailSent)
                    .Include(a => a.Visitor)
                    .Include(a => a.Employee)
                    .ToListAsync(stoppingToken);

                foreach (var appointment in pendingReminders)
                {
                    try
                    {
                        context.EmailQueues.Add(new EmailQueue
                        {
                            AppointmentId = appointment.Id,
                            RecipientEmail = appointment.Visitor.Email,
                            Subject = $"Appointment Reminder: {appointment.Purpose}",
                            Body = $"Dear {appointment.Visitor.FullName}, this is a reminder of your appointment tomorrow at {appointment.RequestedStartTime:HH:mm} with {appointment.Employee.FullName}.",
                            Status = "Pending",
                            CreatedAt = DateTimeOffset.UtcNow
                        });

                        context.SmsQueues.Add(new SmsQueue
                        {
                            AppointmentId = appointment.Id,
                            RecipientPhone = appointment.Visitor.Phone,
                            Message = $"Reminder: Appointment with {appointment.Employee.FullName} tomorrow at {appointment.RequestedStartTime:HH:mm}.",
                            Status = "Pending",
                            CreatedAt = DateTimeOffset.UtcNow
                        });

                        appointment.ReminderEmailSent = true;
                        appointment.ReminderSmsSent = true;

                        _logger.LogInformation("Reminder queued for appointment {Id}", appointment.Id);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error queuing reminder for appointment {Id}", appointment.Id);
                    }
                }

                await context.SaveChangesAsync(stoppingToken);

                var overduePending = await context.Appointments
                    .Where(a => a.Status == "Pending" && a.RequestedDate < DateOnly.FromDateTime(DateTime.UtcNow))
                    .ToListAsync(stoppingToken);

                foreach (var appointment in overduePending)
                {
                    appointment.Status = "Cancelled";
                    appointment.Notes = "Auto-cancelled: appointment date has passed without employee response";
                    appointment.UpdatedAt = DateTimeOffset.UtcNow;
                }

                if (overduePending.Any()) await context.SaveChangesAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in appointment reminder service");
            }

            await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
        }
    }
}
