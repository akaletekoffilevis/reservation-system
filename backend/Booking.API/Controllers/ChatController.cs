using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Booking.Core.DTOs;
using Booking.Core.Enums;
using Booking.Core.Interfaces;

namespace Booking.API.Controllers;

[ApiController]
[Route("api/chat")]
public class ChatController : ControllerBase
{
    private readonly IChatService _chat;

    public ChatController(IChatService chat) => _chat = chat;

    [HttpGet("professional")]
    [Authorize(Roles = "Professional")]
    public async Task<ActionResult<List<ConversationDto>>> GetProfessionalConversations()
    {
        var proId = GetProfessionalId();
        return Ok(await _chat.GetProfessionalConversationsAsync(proId));
    }

    [HttpGet("client/{email}")]
    public async Task<ActionResult<List<ConversationDto>>> GetClientConversations(string email)
    {
        return Ok(await _chat.GetClientConversationsAsync(email));
    }

    [HttpGet("{conversationId}/messages")]
    public async Task<ActionResult<List<ChatMessageDto>>> GetMessages(int conversationId)
    {
        return Ok(await _chat.GetMessagesAsync(conversationId));
    }

    [HttpPost("{conversationId}/messages")]
    public async Task<ActionResult<ChatMessageDto>> SendMessage(int conversationId, [FromBody] SendMessageRequest request)
    {
        var sender = User.IsInRole("Professional") ? ChatMessageSender.Professional : ChatMessageSender.Client;
        return Ok(await _chat.SendMessageAsync(conversationId, request.Content, sender));
    }

    [HttpPost("start")]
    public async Task<ActionResult<ConversationDto>> StartConversation([FromBody] StartConversationRequest request)
    {
        int? clientId = null;
        if (User.Identity?.IsAuthenticated == true)
            if (int.TryParse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value, out var id))
                clientId = id;
        var conv = await _chat.CreateConversationAsync(request.ProfessionalId, clientId, request.ClientName, request.ClientEmail);

        if (!string.IsNullOrEmpty(request.Message))
            await _chat.SendMessageAsync(conv.Id, request.Message, ChatMessageSender.Client);

        return Ok(conv);
    }

    [HttpPut("{conversationId}/read")]
    public async Task<ActionResult> MarkAsRead(int conversationId)
    {
        var sender = User.IsInRole("Professional") ? ChatMessageSender.Professional : ChatMessageSender.Client;
        await _chat.MarkAsReadAsync(conversationId, sender);
        return NoContent();
    }

    private int GetProfessionalId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(claim, out var id) ? id : 0;
    }
}

public class StartConversationRequest
{
    public int ProfessionalId { get; set; }
    public string? ClientName { get; set; }
    public string? ClientEmail { get; set; }
    public string? Message { get; set; }
}
