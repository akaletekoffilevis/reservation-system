using Booking.Core.Interfaces;

namespace Booking.Infrastructure.Services;

public class EmailService : IEmailService
{
    public Task SendConfirmationAsync(string email, string name, string token)
    {
        // TODO: Implement with SendGrid / Mailtrap
        return Task.CompletedTask;
    }

    public Task SendReminderAsync(string email, string name, DateTime startUtc, string businessName)
    {
        // TODO: Implement with SendGrid / Mailtrap
        return Task.CompletedTask;
    }
}
