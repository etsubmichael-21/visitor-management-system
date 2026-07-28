using Microsoft.EntityFrameworkCore;
using EcxVisitorManagement.Data;
using EcxVisitorManagement.Interfaces;
using EcxVisitorManagement.Models;

namespace EcxVisitorManagement.BackgroundServices;

public class AppointmentReminderService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<AppointmentReminderService> _logger;

    public AppointmentReminderService(IServiceProvider serviceProvider, ILogger<AppointmentReminderService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
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
                var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();
                var smsService = scope.ServiceProvider.GetRequiredService<ISmsService>();

                var tomorrow = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));
                var pendingReminders = await context.Appointments
                    .Where(a => a.RequestedDate == tomorrow && a.Status == "Approved" && !a.ReminderEmailSent)
                    .Include(a => a.Visitor)
                    .Include(a => a.Employee)
                    .ThenInclude(e => e.Department)
                    .ToListAsync(stoppingToken);

                foreach (var appointment in pendingReminders)
                {
                    try
                    {
                        if (!string.IsNullOrEmpty(appointment.Visitor?.Email))
                        {
                            await emailService.SendAppointmentReminderAsync(
                                appointment.Visitor.Email,
                                appointment.Visitor.FullName,
                                appointment.Employee?.FullName ?? "",
                                appointment.Employee?.Department?.Name ?? "",
                                appointment.RequestedDate,
                                appointment.RequestedStartTime,
                                appointment.RequestedEndTime,
                                appointment.Purpose);
                        }

                        if (!string.IsNullOrEmpty(appointment.Visitor?.Phone))
                        {
                            await smsService.SendAppointmentNotificationAsync(
                                appointment.Visitor.Phone,
                                appointment.Visitor.FullName,
                                appointment.Employee?.FullName ?? "",
                                appointment.RequestedDate,
                                "Reminder");
                        }

                        if (!string.IsNullOrEmpty(appointment.Employee?.Email))
                        {
                            await emailService.SendEmployeeReminderAsync(
                                appointment.Employee.Email,
                                appointment.Employee.FullName,
                                appointment.Visitor?.FullName ?? "",
                                appointment.Employee?.Department?.Name ?? "",
                                appointment.RequestedDate,
                                appointment.RequestedStartTime,
                                appointment.RequestedEndTime,
                                appointment.Purpose);
                        }

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
