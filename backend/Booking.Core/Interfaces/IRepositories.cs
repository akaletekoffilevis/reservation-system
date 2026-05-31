using Booking.Core.Entities;
using Booking.Core.Enums;

namespace Booking.Core.Interfaces;

public interface IUserRepository
{
    Task<List<User>> GetAllAsync();
    Task<User?> GetByIdAsync(int id);
    Task<User?> GetByEmailAsync(string email);
    Task<User> CreateAsync(User user);
    Task<bool> EmailExistsAsync(string email);
}

public interface IProfessionalRepository
{
    Task<List<Professional>> GetAllAsync(string? search = null);
    Task<List<Professional>> GetAllAdminAsync();
    Task<Professional?> GetBySlugAsync(string slug);
    Task<Professional?> GetByUserIdAsync(int userId);
    Task<Professional?> GetByIdAsync(int id);
    Task<Professional> CreateAsync(Professional professional);
    Task UpdateAsync(Professional professional);
}

public interface IServiceRepository
{
    Task<List<Service>> GetByProfessionalIdAsync(int professionalId);
    Task<Service?> GetByIdAsync(int id);
    Task<Service> CreateAsync(Service service);
    Task UpdateAsync(Service service);
    Task DeleteAsync(Service service);
}

public interface IAppointmentRepository
{
    Task<List<Appointment>> GetAllAsync();
    Task<Appointment?> GetByIdAsync(int id);
    Task<Appointment?> GetByTokenAsync(string token);
    Task<List<Appointment>> GetByProfessionalIdAsync(int professionalId, DateTime? date = null);
    Task<List<Appointment>> GetByClientEmailAsync(string email);
    Task<Appointment> CreateAsync(Appointment appointment);
    Task UpdateAsync(Appointment appointment);
    Task<bool> IsSlotAvailableAsync(int professionalId, DateTime startUtc, DateTime endUtc);
}

public interface IAvailabilityRepository
{
    Task<List<AvailabilitySlot>> GetSlotsByProfessionalIdAsync(int professionalId);
    Task<List<AvailabilityOverride>> GetOverridesByProfessionalIdAsync(int professionalId, DateTime? from = null);
    Task SetSlotsAsync(int professionalId, List<AvailabilitySlot> slots);
    Task<AvailabilityOverride> CreateOverrideAsync(AvailabilityOverride override_);
    Task DeleteOverrideAsync(int id);
}

public interface IRefreshTokenRepository
{
    Task<RefreshToken?> GetByTokenAsync(string token);
    Task CreateAsync(RefreshToken refreshToken);
    Task RevokeAsync(string token);
}

public interface IConversationRepository : IRepository<Conversation>
{
    Task<List<Conversation>> GetProfessionalConversationsAsync(int professionalId);
    Task<List<Conversation>> GetClientConversationsAsync(string clientEmail);
    Task<Conversation?> GetByParticipantsAsync(int professionalId, string clientEmail);
}

public interface IChatMessageRepository : IRepository<ChatMessage>
{
    Task<List<ChatMessage>> GetConversationMessagesAsync(int conversationId);
    Task MarkConversationAsReadAsync(int conversationId, ChatMessageSender reader);
}

public interface IReviewRepository : IRepository<Review>
{
    Task<List<Review>> GetProfessionalReviewsAsync(int professionalId);
    Task<List<Review>> GetPendingReviewsAsync();
    Task<double> GetAverageRatingAsync(int professionalId);
    Task<int> GetReviewsCountAsync(int professionalId);
}

public interface ICategoryRepository : IRepository<Category>
{
    Task<List<Category>> GetAllWithCountsAsync();
}

public interface ITimeOffRepository : IRepository<TimeOff>
{
    Task<List<TimeOff>> GetProfessionalTimeOffsAsync(int professionalId);
    Task<bool> HasOverlapAsync(int professionalId, DateTime start, DateTime end);
}

public interface IRecurringScheduleRepository : IRepository<RecurringSchedule>
{
    Task<List<RecurringSchedule>> GetProfessionalSchedulesAsync(int professionalId);
}
