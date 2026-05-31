using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Booking.Core.DTOs;
using Booking.Core.Entities;
using Booking.Core.Enums;
using Booking.Core.Interfaces;
using Booking.Infrastructure.Data;

namespace Booking.Infrastructure.Services;

public class ChatService : IChatService
{
    private readonly IConversationRepository _conversations;
    private readonly IChatMessageRepository _messages;

    public ChatService(IConversationRepository conversations, IChatMessageRepository messages)
    {
        _conversations = conversations;
        _messages = messages;
    }

    public async Task<ConversationDto> CreateConversationAsync(int professionalId, int? clientId, string? clientName, string? clientEmail)
    {
        var existing = await _conversations.GetByParticipantsAsync(professionalId, clientEmail ?? "");
        if (existing != null)
            return MapConversation(existing, "client");

        var conversation = new Conversation
        {
            ProfessionalId = professionalId,
            ClientId = clientId,
            ClientName = clientName,
            ClientEmail = clientEmail
        };
        await _conversations.CreateAsync(conversation);
        return MapConversation(conversation, "client");
    }

    public async Task<ChatMessageDto> SendMessageAsync(int conversationId, string content, ChatMessageSender sender)
    {
        var msg = new ChatMessage
        {
            ConversationId = conversationId,
            Sender = sender,
            Content = content,
            IsRead = false
        };
        await _messages.CreateAsync(msg);

        var conv = await _conversations.GetByIdAsync(conversationId);
        if (conv != null)
        {
            conv.LastMessage = content;
            conv.LastMessageAt = DateTime.UtcNow;
            if (sender == ChatMessageSender.Client) conv.UnreadCountProfessional++;
            else conv.UnreadCountClient++;
            await _conversations.UpdateAsync(conv);
        }

        return new ChatMessageDto
        {
            Id = msg.Id,
            ConversationId = msg.ConversationId,
            Sender = msg.Sender.ToString(),
            Content = msg.Content,
            IsRead = msg.IsRead,
            CreatedAt = msg.CreatedAt
        };
    }

    public async Task<List<ConversationDto>> GetProfessionalConversationsAsync(int professionalId)
    {
        var convs = await _conversations.GetProfessionalConversationsAsync(professionalId);
        return convs.Select(c => MapConversation(c, "professional")).ToList();
    }

    public async Task<List<ConversationDto>> GetClientConversationsAsync(string clientEmail)
    {
        var convs = await _conversations.GetClientConversationsAsync(clientEmail);
        return convs.Select(c => MapConversation(c, "client")).ToList();
    }

    public async Task<List<ChatMessageDto>> GetMessagesAsync(int conversationId)
    {
        var msgs = await _messages.GetConversationMessagesAsync(conversationId);
        return msgs.Select(m => new ChatMessageDto
        {
            Id = m.Id,
            ConversationId = m.ConversationId,
            Sender = m.Sender.ToString(),
            Content = m.Content,
            IsRead = m.IsRead,
            CreatedAt = m.CreatedAt
        }).ToList();
    }

    public async Task MarkAsReadAsync(int conversationId, ChatMessageSender reader)
    {
        await _messages.MarkConversationAsReadAsync(conversationId, reader);
    }

    private static ConversationDto MapConversation(Conversation c, string forRole)
    {
        return new ConversationDto
        {
            Id = c.Id,
            ProfessionalId = c.ProfessionalId,
            ClientId = c.ClientId,
            ClientName = c.ClientName,
            ClientEmail = c.ClientEmail,
            LastMessage = c.LastMessage,
            LastMessageAt = c.LastMessageAt,
            UnreadCount = forRole == "professional" ? c.UnreadCountProfessional : c.UnreadCountClient,
            IsArchived = c.IsArchived,
            CreatedAt = c.CreatedAt
        };
    }
}

public class ReviewService : IReviewService
{
    private readonly IReviewRepository _reviews;
    private readonly IAppointmentRepository _appointments;

    public ReviewService(IReviewRepository reviews, IAppointmentRepository appointments)
    {
        _reviews = reviews;
        _appointments = appointments;
    }

    public async Task<ReviewDto> CreateReviewAsync(CreateReviewRequest request, string clientName, string? clientEmail)
    {
        var appointment = await _appointments.GetByIdAsync(request.AppointmentId);
        var isVerified = appointment != null && appointment.ClientEmail == clientEmail;

        var review = new Review
        {
            ProfessionalId = request.ProfessionalId,
            AppointmentId = request.AppointmentId,
            ClientName = clientName,
            ClientEmail = clientEmail,
            Rating = (ReviewRating)request.Rating,
            Comment = request.Comment,
            IsApproved = false,
            IsVerified = isVerified
        };
        await _reviews.CreateAsync(review);

        return MapReview(review);
    }

    public async Task<List<ReviewDto>> GetProfessionalReviewsAsync(int professionalId)
    {
        var reviews = await _reviews.GetProfessionalReviewsAsync(professionalId);
        return reviews.Select(MapReview).ToList();
    }

    public async Task<List<ReviewDto>> GetPendingReviewsAsync()
    {
        var reviews = await _reviews.GetPendingReviewsAsync();
        return reviews.Select(MapReview).ToList();
    }

    public async Task<ReviewDto> ApproveReviewAsync(int reviewId)
    {
        var review = await _reviews.GetByIdAsync(reviewId);
        if (review == null) throw new KeyNotFoundException("Avis introuvable");
        review.IsApproved = true;
        await _reviews.UpdateAsync(review);
        return MapReview(review);
    }

    public async Task<ReviewDto> RejectReviewAsync(int reviewId)
    {
        var review = await _reviews.GetByIdAsync(reviewId);
        if (review == null) throw new KeyNotFoundException("Avis introuvable");
        await _reviews.DeleteAsync(review);
        return MapReview(review);
    }

    private static ReviewDto MapReview(Review r) => new()
    {
        Id = r.Id, ProfessionalId = r.ProfessionalId, ClientName = r.ClientName,
        Rating = (int)r.Rating, Comment = r.Comment, IsVerified = r.IsVerified,
        CreatedAt = r.CreatedAt
    };
}

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _categories;

    public CategoryService(ICategoryRepository categories) => _categories = categories;

    public async Task<List<CategoryDto>> GetAllCategoriesAsync()
    {
        var cats = await _categories.GetAllWithCountsAsync();
        return cats.Where(c => c.ParentCategoryId == null).Select(MapCategory).ToList();
    }

    public async Task<CategoryDto> CreateCategoryAsync(string name, string? description, string? icon, int? parentId)
    {
        var cat = new Category { Name = name, Description = description, Icon = icon, ParentCategoryId = parentId };
        await _categories.CreateAsync(cat);
        return MapCategory(cat);
    }

    private static CategoryDto MapCategory(Category c) => new()
    {
        Id = c.Id, Name = c.Name, Icon = c.Icon, ParentCategoryId = c.ParentCategoryId,
        DisplayOrder = c.DisplayOrder, ProfessionalCount = c.Professionals?.Count ?? 0,
        SubCategories = c.SubCategories?.Select(MapCategory).ToList() ?? new()
    };
}

public class TimeOffService : ITimeOffService
{
    private readonly ITimeOffRepository _timeOffs;

    public TimeOffService(ITimeOffRepository timeOffs) => _timeOffs = timeOffs;

    public async Task<List<TimeOffDto>> GetProfessionalTimeOffsAsync(int professionalId)
    {
        var list = await _timeOffs.GetProfessionalTimeOffsAsync(professionalId);
        return list.Select(t => new TimeOffDto
        {
            Id = t.Id, Type = t.Type.ToString(), StartDate = t.StartDate,
            EndDate = t.EndDate, Reason = t.Reason, IsActive = t.IsActive
        }).ToList();
    }

    public async Task<TimeOffDto> CreateTimeOffAsync(int professionalId, CreateTimeOffRequest request)
    {
        var overlap = await _timeOffs.HasOverlapAsync(professionalId, request.StartDate, request.EndDate);
        if (overlap) throw new InvalidOperationException("Période de congé chevauchante");

        var timeOff = new TimeOff
        {
            ProfessionalId = professionalId,
            Type = Enum.Parse<TimeOffType>(request.Type),
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Reason = request.Reason
        };
        await _timeOffs.CreateAsync(timeOff);
        return new TimeOffDto
        {
            Id = timeOff.Id, Type = timeOff.Type.ToString(), StartDate = timeOff.StartDate,
            EndDate = timeOff.EndDate, Reason = timeOff.Reason, IsActive = timeOff.IsActive
        };
    }

    public async Task CancelTimeOffAsync(int timeOffId)
    {
        var timeOff = await _timeOffs.GetByIdAsync(timeOffId);
        if (timeOff != null)
        {
            timeOff.IsActive = false;
            await _timeOffs.UpdateAsync(timeOff);
        }
    }
}

public class RecurringScheduleService : IRecurringScheduleService
{
    private readonly IRecurringScheduleRepository _schedules;

    public RecurringScheduleService(IRecurringScheduleRepository schedules) => _schedules = schedules;

    public async Task<List<RecurringScheduleDto>> GetProfessionalSchedulesAsync(int professionalId)
    {
        var list = await _schedules.GetProfessionalSchedulesAsync(professionalId);
        return list.Select(s => new RecurringScheduleDto
        {
            Id = s.Id, Type = s.Type.ToString(), DayOfWeek = s.DayOfWeek.ToString(),
            StartTime = s.StartTime.ToString(@"hh\:mm"), EndTime = s.EndTime.ToString(@"hh\:mm"),
            ValidFrom = s.ValidFrom, ValidUntil = s.ValidUntil, Interval = s.Interval, IsActive = s.IsActive
        }).ToList();
    }

    public async Task<RecurringScheduleDto> CreateScheduleAsync(int professionalId, CreateRecurringScheduleRequest request)
    {
        var schedule = new RecurringSchedule
        {
            ProfessionalId = professionalId,
            Type = Enum.Parse<RecurringScheduleType>(request.Type),
            DayOfWeek = (DayOfWeek)request.DayOfWeek,
            StartTime = TimeSpan.Parse(request.StartTime),
            EndTime = TimeSpan.Parse(request.EndTime),
            ValidFrom = request.ValidFrom,
            ValidUntil = request.ValidUntil,
            Interval = request.Interval
        };
        await _schedules.CreateAsync(schedule);
        return new RecurringScheduleDto
        {
            Id = schedule.Id, Type = schedule.Type.ToString(), DayOfWeek = schedule.DayOfWeek.ToString(),
            StartTime = schedule.StartTime.ToString(@"hh\:mm"), EndTime = schedule.EndTime.ToString(@"hh\:mm"),
            ValidFrom = schedule.ValidFrom, ValidUntil = schedule.ValidUntil, Interval = schedule.Interval, IsActive = schedule.IsActive
        };
    }

    public async Task DeleteScheduleAsync(int scheduleId)
    {
        var schedule = await _schedules.GetByIdAsync(scheduleId);
        if (schedule != null) await _schedules.DeleteAsync(schedule);
    }
}

public class AdminService : IAdminService
{
    private readonly IProfessionalRepository _pros;
    private readonly IUserRepository _users;
    private readonly IAppointmentRepository _appointments;
    private readonly IReviewRepository _reviews;

    public AdminService(IProfessionalRepository pros, IUserRepository users,
        IAppointmentRepository appointments, IReviewRepository reviews)
    {
        _pros = pros; _users = users; _appointments = appointments; _reviews = reviews;
    }

    public async Task<AdminDashboardStatsDto> GetDashboardStatsAsync()
    {
        var allPros = await _pros.GetAllAsync();
        var allUsers = await _users.GetAllAsync();
        var allAppointments = await _appointments.GetAllAsync();
        var today = DateTime.UtcNow.Date;

        return new AdminDashboardStatsDto
        {
            TotalProfessionals = allPros.Count,
            ActiveProfessionals = allPros.Count(p => p.IsActive),
            TotalClients = allUsers.Count(u => u.Role == UserRole.Client),
            TotalAppointments = allAppointments.Count,
            TodayAppointments = allAppointments.Count(a => a.StartUtc.Date == today),
            TotalRevenue = allAppointments.Where(a => a.Status == AppointmentStatus.Completed).Sum(a => (decimal)0),
            PendingReviews = (await _reviews.GetPendingReviewsAsync()).Count,
            LatestAppointments = allAppointments.OrderByDescending(a => a.CreatedAt).Take(10).Select(a => new AppointmentDto
            {
                Id = a.Id, ProfessionalId = a.ProfessionalId, ServiceId = a.ServiceId,
                ClientName = a.ClientName, ClientEmail = a.ClientEmail,
                StartUtc = a.StartUtc, EndUtc = a.EndUtc, Status = a.Status.ToString(),
                Token = a.Token
            }).ToList()
        };
    }

    public async Task<List<ProfessionalDto>> GetAllProfessionalsAsync()
    {
        var pros = await _pros.GetAllAdminAsync();
        return pros.Select(p => new ProfessionalDto
        {
            Id = p.Id, Slug = p.Slug, BusinessName = p.BusinessName,
            Description = p.Description, City = p.City, Address = p.Address,
            Phone = p.Phone, Email = p.User?.Email, IsActive = p.IsActive
        }).ToList();
    }

    public async Task ToggleProfessionalStatusAsync(int professionalId, bool isActive)
    {
        var pro = await _pros.GetByIdAsync(professionalId);
        if (pro != null)
        {
            pro.IsActive = isActive;
            await _pros.UpdateAsync(pro);
        }
    }
}

public class SmsService : ISmsService
{
    private readonly IConfiguration _config;

    public SmsService(IConfiguration config) => _config = config;

    public async Task SendSmsAsync(string phone, string message)
    {
        // TODO: Implement Twilio integration
        // var accountSid = _config["Twilio:AccountSid"];
        // var authToken = _config["Twilio:AuthToken"];
        // TwilioClient.Init(accountSid, authToken);
        // await MessageResource.CreateAsync(body: message, from: new PhoneNumber(_config["Twilio:From"]), to: new PhoneNumber(phone));
        await Task.CompletedTask;
        Console.WriteLine($"[SMS] To: {phone}, Message: {message}");
    }
}
