using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using Booking.Core.Enums;
using Booking.Core.Interfaces;

namespace Booking.API.Hubs;

[Authorize]
public class ChatHub : Hub
{
    private readonly IChatService _chat;

    public ChatHub(IChatService chat) => _chat = chat;

    public async Task JoinConversation(int conversationId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"conv_{conversationId}");
    }

    public async Task LeaveConversation(int conversationId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"conv_{conversationId}");
    }

    public async Task SendMessage(int conversationId, string content)
    {
        var sender = Context.User?.IsInRole("Professional") == true
            ? ChatMessageSender.Professional
            : ChatMessageSender.Client;

        var msg = await _chat.SendMessageAsync(conversationId, content, sender);

        await Clients.Group($"conv_{conversationId}").SendAsync("ReceiveMessage", msg);

        var conv = await _chat.GetMessagesAsync(conversationId);
        var unread = conv.Count(m => !m.IsRead);
        await Clients.Group($"conv_{conversationId}").SendAsync("UnreadUpdate", conversationId, unread);
    }
}
