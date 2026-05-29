using System.Text.Json.Serialization;

namespace Booking.Core.Entities;

public class Service
{
    public int Id { get; set; }
    public int ProfessionalId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int DurationMinutes { get; set; }
    public decimal Price { get; set; }
    public bool IsActive { get; set; } = true;

    [JsonIgnore] public Professional Professional { get; set; } = null!;
    [JsonIgnore] public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
}
