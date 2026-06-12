using Booking.Core.Enums;
using Booking.Core.Interfaces;
using Booking.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Booking.Infrastructure.Services;

public class ReminderBackgroundService : BackgroundService
{
    private readonly IServiceProvider _services;
    private readonly ILogger<ReminderBackgroundService> _logger;
    private static readonly TimeSpan Interval = TimeSpan.FromMinutes(5);

    public ReminderBackgroundService(IServiceProvider services, ILogger<ReminderBackgroundService> logger)
    {
        _services = services;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("ReminderBackgroundService started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessRemindersAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing reminders");
            }

            await Task.Delay(Interval, stoppingToken);
        }
    }

    private async Task ProcessRemindersAsync(CancellationToken ct)
    {
        using var scope = _services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();
        var smsService = scope.ServiceProvider.GetRequiredService<ISmsService>();

        var now = DateTime.UtcNow;
        var windowEnd = now.AddHours(24);

        var pendingReminders = await db.Appointments
            .Where(a => a.Status == AppointmentStatus.Confirmed
                        && !a.ReminderSent
                        && a.StartUtc > now
                        && a.StartUtc <= windowEnd)
            .Include(a => a.Professional)
            .Include(a => a.Service)
            .ToListAsync(ct);

        foreach (var appointment in pendingReminders)
        {
            try
            {
                await emailService.SendReminderAsync(
                    appointment.ClientEmail,
                    appointment.ClientName,
                    appointment.StartUtc,
                    appointment.Professional.BusinessName,
                    appointment.Token);

                if (!string.IsNullOrEmpty(appointment.ClientPhone))
                {
                    var localTime = appointment.StartUtc.ToLocalTime();
                    var msg = $"Rappel Planity : rendez-vous chez {appointment.Professional.BusinessName} le {localTime:dd/MM/yyyy} à {localTime:HH:mm}. Gerez : {appointment.Token}";
                    await smsService.SendSmsAsync(appointment.ClientPhone, msg);
                }

                appointment.ReminderSent = true;
                _logger.LogInformation("Reminder sent for appointment {Id}", appointment.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send reminder for appointment {Id}", appointment.Id);
            }
        }

        await db.SaveChangesAsync(ct);
    }
}
