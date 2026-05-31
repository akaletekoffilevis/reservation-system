using System.Text.Json.Serialization;
using Booking.Core.Enums;

namespace Booking.Core.Entities;

public class RecurringSchedule
{
    public int Id { get; set; }
    public int ProfessionalId { get; set; }
    public RecurringScheduleType Type { get; set; }
    public DayOfWeek DayOfWeek { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public DateTime? ValidFrom { get; set; }
    public DateTime? ValidUntil { get; set; }
    public int Interval { get; set; } = 1;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [JsonIgnore] public Professional Professional { get; set; } = null!;
}
