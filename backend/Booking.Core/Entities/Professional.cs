using System.Text.Json.Serialization;

namespace Booking.Core.Entities;

public class Professional
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string BusinessName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Phone { get; set; }
    public bool IsActive { get; set; } = true;

    [JsonIgnore] public User User { get; set; } = null!;
    [JsonIgnore] public ICollection<Service> Services { get; set; } = new List<Service>();
    [JsonIgnore] public ICollection<AvailabilitySlot> AvailabilitySlots { get; set; } = new List<AvailabilitySlot>();
    [JsonIgnore] public ICollection<AvailabilityOverride> AvailabilityOverrides { get; set; } = new List<AvailabilityOverride>();
    [JsonIgnore] public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
}
