using System.Text.Json.Serialization;

namespace Booking.Core.Entities;

public class Conversation
{
    public int Id { get; set; }
    public int ProfessionalId { get; set; }
    public int? ClientId { get; set; }
    public string? ClientName { get; set; }
    public string? ClientEmail { get; set; }
    public string? LastMessage { get; set; }
    public DateTime? LastMessageAt { get; set; }
    public int UnreadCountProfessional { get; set; }
    public int UnreadCountClient { get; set; }
    public bool IsArchived { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [JsonIgnore] public Professional Professional { get; set; } = null!;
    [JsonIgnore] public User? Client { get; set; }
    [JsonIgnore] public ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
}
