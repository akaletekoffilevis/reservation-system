using Booking.Core.DTOs;
using Booking.Core.Enums;

namespace Booking.Core.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<AuthResponse> RefreshTokenAsync(string refreshToken);
    Task LogoutAsync(string refreshToken);
}

public interface IEmailService
{
    Task SendConfirmationAsync(string email, string name, string token);
    Task SendReminderAsync(string email, string name, DateTime startUtc, string businessName);
}

public interface IChatService
{
    Task<ConversationDto> CreateConversationAsync(int professionalId, int? clientId, string? clientName, string? clientEmail);
    Task<ChatMessageDto> SendMessageAsync(int conversationId, string content, ChatMessageSender sender);
    Task<List<ConversationDto>> GetProfessionalConversationsAsync(int professionalId);
    Task<List<ConversationDto>> GetClientConversationsAsync(string clientEmail);
    Task<List<ChatMessageDto>> GetMessagesAsync(int conversationId);
    Task MarkAsReadAsync(int conversationId, ChatMessageSender reader);
}

public interface IReviewService
{
    Task<ReviewDto> CreateReviewAsync(CreateReviewRequest request, string clientName, string? clientEmail);
    Task<List<ReviewDto>> GetProfessionalReviewsAsync(int professionalId);
    Task<List<ReviewDto>> GetPendingReviewsAsync();
    Task<ReviewDto> ApproveReviewAsync(int reviewId);
    Task<ReviewDto> RejectReviewAsync(int reviewId);
}

public interface ICategoryService
{
    Task<List<CategoryDto>> GetAllCategoriesAsync();
    Task<CategoryDto> CreateCategoryAsync(string name, string? description, string? icon, int? parentId);
}

public interface ITimeOffService
{
    Task<List<TimeOffDto>> GetProfessionalTimeOffsAsync(int professionalId);
    Task<TimeOffDto> CreateTimeOffAsync(int professionalId, CreateTimeOffRequest request);
    Task CancelTimeOffAsync(int timeOffId);
}

public interface IRecurringScheduleService
{
    Task<List<RecurringScheduleDto>> GetProfessionalSchedulesAsync(int professionalId);
    Task<RecurringScheduleDto> CreateScheduleAsync(int professionalId, CreateRecurringScheduleRequest request);
    Task DeleteScheduleAsync(int scheduleId);
}

public interface IAdminService
{
    Task<AdminDashboardStatsDto> GetDashboardStatsAsync();
    Task<List<ProfessionalDto>> GetAllProfessionalsAsync();
    Task ToggleProfessionalStatusAsync(int professionalId, bool isActive);
}

public interface ISmsService
{
    Task SendSmsAsync(string phone, string message);
}
