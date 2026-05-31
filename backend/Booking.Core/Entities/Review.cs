using System.Text.Json.Serialization;
using Booking.Core.Enums;

namespace Booking.Core.Entities;

public class Review
{
    public int Id { get; set; }
    public int ProfessionalId { get; set; }
    public int? ClientId { get; set; }
    public int AppointmentId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public string? ClientEmail { get; set; }
    public ReviewRating Rating { get; set; }
    public string? Comment { get; set; }
    public bool IsApproved { get; set; }
    public bool IsVerified { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [JsonIgnore] public Professional Professional { get; set; } = null!;
    [JsonIgnore] public User? Client { get; set; }
    [JsonIgnore] public Appointment Appointment { get; set; } = null!;
}
