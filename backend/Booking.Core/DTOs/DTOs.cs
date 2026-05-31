namespace Booking.Core.DTOs;

public class RegisterRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string Timezone { get; set; } = "UTC";
    public bool IsProfessional { get; set; }
    public string? BusinessName { get; set; }
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public UserDto User { get; set; } = null!;
}

public class RefreshTokenRequest
{
    public string RefreshToken { get; set; } = string.Empty;
}

public class UserDto
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Timezone { get; set; } = string.Empty;
}

public class ProfessionalDto
{
    public int Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string BusinessName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public bool IsActive { get; set; }
    public List<ServiceDto> Services { get; set; } = new();
}

public class ServiceDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int DurationMinutes { get; set; }
    public decimal Price { get; set; }
}

public class CreateServiceRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int DurationMinutes { get; set; }
    public decimal Price { get; set; }
}

public class CreateAppointmentRequest
{
    public int ProfessionalId { get; set; }
    public int ServiceId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public string ClientEmail { get; set; } = string.Empty;
    public string? ClientPhone { get; set; }
    public DateTime StartUtc { get; set; }
    public string? Notes { get; set; }
}

public class AppointmentDto
{
    public int Id { get; set; }
    public int ProfessionalId { get; set; }
    public int ServiceId { get; set; }
    public string Token { get; set; } = string.Empty;
    public string ClientName { get; set; } = string.Empty;
    public string ClientEmail { get; set; } = string.Empty;
    public string? ClientPhone { get; set; }
    public DateTime StartUtc { get; set; }
    public DateTime EndUtc { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public string ServiceName { get; set; } = string.Empty;
    public string BusinessName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class AvailabilitySlotDto
{
    public int Id { get; set; }
    public string DayOfWeek { get; set; } = string.Empty;
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
}

public class AvailabilityOverrideDto
{
    public int Id { get; set; }
    public DateTime Date { get; set; }
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
    public string? Reason { get; set; }
    public bool IsBlocked { get; set; }
}

public class CancelRequest
{
    public string? Reason { get; set; }
}

public class RescheduleRequest
{
    public DateTime NewStartUtc { get; set; }
}

// ─── Chat DTOs ───
public class SendMessageRequest
{
    public string Content { get; set; } = string.Empty;
}

public class ConversationDto
{
    public int Id { get; set; }
    public int ProfessionalId { get; set; }
    public string? ProfessionalName { get; set; }
    public int? ClientId { get; set; }
    public string? ClientName { get; set; }
    public string? ClientEmail { get; set; }
    public string? LastMessage { get; set; }
    public DateTime? LastMessageAt { get; set; }
    public int UnreadCount { get; set; }
    public bool IsArchived { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ChatMessageDto
{
    public int Id { get; set; }
    public int ConversationId { get; set; }
    public string Sender { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
}

// ─── Review DTOs ───
public class CreateReviewRequest
{
    public int ProfessionalId { get; set; }
    public int AppointmentId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public string? ClientName { get; set; }
    public string? ClientEmail { get; set; }
}

public class ReviewDto
{
    public int Id { get; set; }
    public int ProfessionalId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public bool IsVerified { get; set; }
    public DateTime CreatedAt { get; set; }
}

// ─── Category DTOs ───
public class CategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public int? ParentCategoryId { get; set; }
    public int DisplayOrder { get; set; }
    public int ProfessionalCount { get; set; }
    public List<CategoryDto> SubCategories { get; set; } = new();
}

// ─── TimeOff DTOs ───
public class CreateTimeOffRequest
{
    public string Type { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string? Reason { get; set; }
}

public class TimeOffDto
{
    public int Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string? Reason { get; set; }
    public bool IsActive { get; set; }
}

// ─── RecurringSchedule DTOs ───
public class CreateRecurringScheduleRequest
{
    public string Type { get; set; } = string.Empty;
    public int DayOfWeek { get; set; }
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
    public DateTime? ValidFrom { get; set; }
    public DateTime? ValidUntil { get; set; }
    public int Interval { get; set; } = 1;
}

public class RecurringScheduleDto
{
    public int Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string DayOfWeek { get; set; } = string.Empty;
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
    public DateTime? ValidFrom { get; set; }
    public DateTime? ValidUntil { get; set; }
    public int Interval { get; set; }
    public bool IsActive { get; set; }
}

// ─── Admin DTOs ───
public class AdminDashboardStatsDto
{
    public int TotalProfessionals { get; set; }
    public int ActiveProfessionals { get; set; }
    public int TotalClients { get; set; }
    public int TotalAppointments { get; set; }
    public int TodayAppointments { get; set; }
    public decimal TotalRevenue { get; set; }
    public int PendingReviews { get; set; }
    public List<AppointmentDto> LatestAppointments { get; set; } = new();
}

// ─── SMS DTO ───
public class SendSmsRequest
{
    public string Phone { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}
