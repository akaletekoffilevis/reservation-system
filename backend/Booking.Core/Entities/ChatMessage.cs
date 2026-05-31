using System.Text.Json.Serialization;
using Booking.Core.Enums;

namespace Booking.Core.Entities;

public class ChatMessage
{
    public int Id { get; set; }
    public int ConversationId { get; set; }
    public ChatMessageSender Sender { get; set; }
    public string Content { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [JsonIgnore] public Conversation Conversation { get; set; } = null!;
}
