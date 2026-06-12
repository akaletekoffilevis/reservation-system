using Booking.Core.Interfaces;
using MailKit.Net.Smtp;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MimeKit;

namespace Booking.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task SendConfirmationAsync(string email, string name, string token)
    {
        var subject = "Confirmation de votre rendez-vous - Planity";
        var body = $"""
            Bonjour {name},

            Votre rendez-vous a été confirmé.

            Lien de gestion : {_config["App:BaseUrl"]}/manage/{token}

            Cordialement,
            L'équipe Planity
            """;

        await SendEmailAsync(email, subject, body);
    }

    public async Task SendReminderAsync(string email, string name, DateTime startUtc, string businessName, string? token = null)
    {
        var localTime = startUtc.ToLocalTime();
        var subject = "Rappel de votre rendez-vous - Planity";
        var manageLink = token != null ? $"\n\nLien de gestion : {_config["App:BaseUrl"]}/manage/{token}" : "";
        var body = $"""
            Bonjour {name},

            Ceci est un rappel pour votre rendez-vous chez {businessName}
            le {localTime:dd/MM/yyyy} à {localTime:HH:mm}.{manageLink}

            Cordialement,
            L'équipe Planity
            """;

        await SendEmailAsync(email, subject, body);
    }

    private async Task SendEmailAsync(string to, string subject, string body)
    {
        var smtpHost = _config["Email:SmtpHost"];
        var smtpPort = _config.GetValue<int>("Email:SmtpPort");
        var smtpUser = _config["Email:SmtpUser"];
        var smtpPass = _config["Email:SmtpPass"];
        var fromEmail = _config["Email:From"] ?? "noreply@booking.app";

        if (string.IsNullOrEmpty(smtpHost))
        {
            _logger.LogInformation("[Email] SMTP not configured. Would send to {To}: {Subject}", to, subject);
            _logger.LogInformation("[Email] Body: {Body}", body);
            return;
        }

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("Planity", fromEmail));
        message.To.Add(new MailboxAddress("", to));
        message.Subject = subject;
        message.Body = new TextPart("plain") { Text = body };

        using var client = new SmtpClient();
        await client.ConnectAsync(smtpHost, smtpPort, smtpPort == 587);
        if (!string.IsNullOrEmpty(smtpUser))
            await client.AuthenticateAsync(smtpUser, smtpPass);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }
}
