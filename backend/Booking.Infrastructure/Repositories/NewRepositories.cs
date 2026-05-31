using Microsoft.EntityFrameworkCore;
using Booking.Core.Entities;
using Booking.Core.Interfaces;
using Booking.Core.Enums;
using Booking.Infrastructure.Data;

namespace Booking.Infrastructure.Repositories;

public class ConversationRepository : Repository<Conversation>, IConversationRepository
{
    public ConversationRepository(AppDbContext db) : base(db) { }

    public async Task<List<Conversation>> GetProfessionalConversationsAsync(int professionalId)
    {
        return await _db.Conversations
            .Where(c => c.ProfessionalId == professionalId && !c.IsArchived)
            .OrderByDescending(c => c.LastMessageAt ?? c.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<Conversation>> GetClientConversationsAsync(string clientEmail)
    {
        return await _db.Conversations
            .Where(c => c.ClientEmail == clientEmail && !c.IsArchived)
            .OrderByDescending(c => c.LastMessageAt ?? c.CreatedAt)
            .ToListAsync();
    }

    public async Task<Conversation?> GetByParticipantsAsync(int professionalId, string clientEmail)
    {
        return await _db.Conversations
            .FirstOrDefaultAsync(c => c.ProfessionalId == professionalId && c.ClientEmail == clientEmail);
    }
}

public class ChatMessageRepository : Repository<ChatMessage>, IChatMessageRepository
{
    public ChatMessageRepository(AppDbContext db) : base(db) { }

    public async Task<List<ChatMessage>> GetConversationMessagesAsync(int conversationId)
    {
        return await _db.ChatMessages
            .Where(m => m.ConversationId == conversationId)
            .OrderBy(m => m.CreatedAt)
            .ToListAsync();
    }

    public async Task MarkConversationAsReadAsync(int conversationId, ChatMessageSender reader)
    {
        var messages = await _db.ChatMessages
            .Where(m => m.ConversationId == conversationId && m.Sender != reader && !m.IsRead)
            .ToListAsync();
        foreach (var msg in messages) msg.IsRead = true;
    }
}

public class ReviewRepository : Repository<Review>, IReviewRepository
{
    public ReviewRepository(AppDbContext db) : base(db) { }

    public async Task<List<Review>> GetProfessionalReviewsAsync(int professionalId)
    {
        return await _db.Reviews
            .Where(r => r.ProfessionalId == professionalId && r.IsApproved)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<Review>> GetPendingReviewsAsync()
    {
        return await _db.Reviews
            .Where(r => !r.IsApproved)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<double> GetAverageRatingAsync(int professionalId)
    {
        var ratings = await _db.Reviews
            .Where(r => r.ProfessionalId == professionalId && r.IsApproved)
            .Select(r => (int)r.Rating)
            .ToListAsync();
        return ratings.Any() ? ratings.Average() : 0;
    }

    public async Task<int> GetReviewsCountAsync(int professionalId)
    {
        return await _db.Reviews.CountAsync(r => r.ProfessionalId == professionalId && r.IsApproved);
    }
}

public class CategoryRepository : Repository<Category>, ICategoryRepository
{
    public CategoryRepository(AppDbContext db) : base(db) { }

    public async Task<List<Category>> GetAllWithCountsAsync()
    {
        return await _db.Categories
            .Where(c => c.IsActive)
            .Include(c => c.SubCategories)
            .Include(c => c.Professionals)
            .OrderBy(c => c.DisplayOrder)
            .ToListAsync();
    }
}

public class TimeOffRepository : Repository<TimeOff>, ITimeOffRepository
{
    public TimeOffRepository(AppDbContext db) : base(db) { }

    public async Task<List<TimeOff>> GetProfessionalTimeOffsAsync(int professionalId)
    {
        return await _db.TimeOffs
            .Where(t => t.ProfessionalId == professionalId && t.IsActive)
            .OrderBy(t => t.StartDate)
            .ToListAsync();
    }

    public async Task<bool> HasOverlapAsync(int professionalId, DateTime start, DateTime end)
    {
        return await _db.TimeOffs.AnyAsync(t =>
            t.ProfessionalId == professionalId && t.IsActive &&
            t.StartDate < end && t.EndDate > start);
    }
}

public class RecurringScheduleRepository : Repository<RecurringSchedule>, IRecurringScheduleRepository
{
    public RecurringScheduleRepository(AppDbContext db) : base(db) { }

    public async Task<List<RecurringSchedule>> GetProfessionalSchedulesAsync(int professionalId)
    {
        var schedules = await _db.RecurringSchedules
            .Where(s => s.ProfessionalId == professionalId && s.IsActive)
            .ToListAsync();
        return schedules.OrderBy(s => s.DayOfWeek).ThenBy(s => s.StartTime).ToList();
    }
}
