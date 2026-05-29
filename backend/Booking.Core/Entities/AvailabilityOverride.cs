using System.Text.Json.Serialization;

namespace Booking.Core.Entities;

public class AvailabilityOverride
{
    public int Id { get; set; }
    public int ProfessionalId { get; set; }
    public DateTime Date { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public string? Reason { get; set; }
    public bool IsBlocked { get; set; } = true;

    [JsonIgnore] public Professional Professional { get; set; } = null!;
}
