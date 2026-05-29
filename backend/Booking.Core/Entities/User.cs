using System.Text.Json.Serialization;
using Booking.Core.Enums;

namespace Booking.Core.Entities;

public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Client;
    public string Timezone { get; set; } = "UTC";
    public string? Phone { get; set; }
    public bool EmailConfirmed { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [JsonIgnore] public Professional? Professional { get; set; }
    [JsonIgnore] public NotificationPreference? NotificationPreference { get; set; }
    [JsonIgnore] public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}
