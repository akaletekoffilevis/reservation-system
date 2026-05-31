using System.Text.Json.Serialization;
using Booking.Core.Enums;

namespace Booking.Core.Entities;

public class TimeOff
{
    public int Id { get; set; }
    public int ProfessionalId { get; set; }
    public TimeOffType Type { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string? Reason { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [JsonIgnore] public Professional Professional { get; set; } = null!;
}
