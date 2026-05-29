using System.Text.Json.Serialization;
using Booking.Core.Enums;

namespace Booking.Core.Entities;

public class Appointment
{
    public int Id { get; set; }
    public int ProfessionalId { get; set; }
    public int ServiceId { get; set; }
    public int? ClientId { get; set; }
    public string Token { get; set; } = Guid.NewGuid().ToString("N")[..16];
    public string ClientName { get; set; } = string.Empty;
    public string ClientEmail { get; set; } = string.Empty;
    public string? ClientPhone { get; set; }
    public DateTime StartUtc { get; set; }
    public DateTime EndUtc { get; set; }
    public AppointmentStatus Status { get; set; } = AppointmentStatus.Pending;
    public string? Notes { get; set; }
    public string? CancellationReason { get; set; }
    public string ConcurrencyStamp { get; set; } = Guid.NewGuid().ToString();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    [JsonIgnore] public Professional Professional { get; set; } = null!;
    [JsonIgnore] public Service Service { get; set; } = null!;
    [JsonIgnore] public User? Client { get; set; }
}
