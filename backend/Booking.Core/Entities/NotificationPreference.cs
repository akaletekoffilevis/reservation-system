using System.Text.Json.Serialization;

namespace Booking.Core.Entities;

public class NotificationPreference
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public bool EmailEnabled { get; set; } = true;
    public bool SmsEnabled { get; set; }
    public bool PushEnabled { get; set; }
    public int ReminderMinutesBefore { get; set; } = 1440;

    [JsonIgnore] public User User { get; set; } = null!;
}
