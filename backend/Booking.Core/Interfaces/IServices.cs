using Booking.Core.DTOs;

namespace Booking.Core.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<AuthResponse> RefreshTokenAsync(string refreshToken);
    Task LogoutAsync(string refreshToken);
}

public interface IEmailService
{
    Task SendConfirmationAsync(string email, string name, string token);
    Task SendReminderAsync(string email, string name, DateTime startUtc, string businessName);
}
