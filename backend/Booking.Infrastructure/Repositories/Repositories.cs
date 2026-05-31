using Booking.Core.Entities;
using Booking.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Booking.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly Data.AppDbContext _db;
    public UserRepository(Data.AppDbContext db) => _db = db;

    public async Task<List<User>> GetAllAsync() =>
        await _db.Users.ToListAsync();

    public async Task<User?> GetByIdAsync(int id) =>
        await _db.Users.FindAsync(id);

    public async Task<User?> GetByEmailAsync(string email) =>
        await _db.Users.FirstOrDefaultAsync(u => u.Email == email);

    public async Task<User> CreateAsync(User user)
    {
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        return user;
    }

    public async Task<bool> EmailExistsAsync(string email) =>
        await _db.Users.AnyAsync(u => u.Email == email);
}

public class ProfessionalRepository : IProfessionalRepository
{
    private readonly Data.AppDbContext _db;
    public ProfessionalRepository(Data.AppDbContext db) => _db = db;

    public async Task<List<Professional>> GetAllAsync(string? search = null)
    {
        var query = _db.Professionals.Include(p => p.Services).AsQueryable();
        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(p => p.BusinessName.Contains(search) || (p.City != null && p.City.Contains(search)));
        return await query.Where(p => p.IsActive).ToListAsync();
    }

    public async Task<Professional?> GetBySlugAsync(string slug) =>
        await _db.Professionals.Include(p => p.Services).FirstOrDefaultAsync(p => p.Slug == slug);

    public async Task<Professional?> GetByIdAsync(int id) =>
        await _db.Professionals.Include(p => p.User).Include(p => p.Services).FirstOrDefaultAsync(p => p.Id == id);

    public async Task<List<Professional>> GetAllAdminAsync() =>
        await _db.Professionals.Include(p => p.User).Include(p => p.Services).ToListAsync();

    public async Task<Professional?> GetByUserIdAsync(int userId) =>
        await _db.Professionals.Include(p => p.User).FirstOrDefaultAsync(p => p.UserId == userId);

    public async Task<Professional> CreateAsync(Professional professional)
    {
        _db.Professionals.Add(professional);
        await _db.SaveChangesAsync();
        return professional;
    }

    public Task UpdateAsync(Professional professional)
    {
        _db.Professionals.Update(professional);
        return _db.SaveChangesAsync();
    }
}

public class ServiceRepository : IServiceRepository
{
    private readonly Data.AppDbContext _db;
    public ServiceRepository(Data.AppDbContext db) => _db = db;

    public async Task<List<Service>> GetByProfessionalIdAsync(int professionalId) =>
        await _db.Services.Where(s => s.ProfessionalId == professionalId && s.IsActive).ToListAsync();

    public async Task<Service?> GetByIdAsync(int id) =>
        await _db.Services.FindAsync(id);

    public async Task<Service> CreateAsync(Service service)
    {
        _db.Services.Add(service);
        await _db.SaveChangesAsync();
        return service;
    }

    public Task UpdateAsync(Service service)
    {
        _db.Services.Update(service);
        return _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(Service service)
    {
        service.IsActive = false;
        _db.Services.Update(service);
        await _db.SaveChangesAsync();
    }
}

public class AppointmentRepository : IAppointmentRepository
{
    private readonly Data.AppDbContext _db;
    public AppointmentRepository(Data.AppDbContext db) => _db = db;

    public async Task<List<Appointment>> GetAllAsync() =>
        await _db.Appointments
            .Include(a => a.Service)
            .Include(a => a.Professional)
            .ToListAsync();

    public async Task<Appointment?> GetByIdAsync(int id) =>
        await _db.Appointments
            .Include(a => a.Service)
            .Include(a => a.Professional)
            .FirstOrDefaultAsync(a => a.Id == id);

    public async Task<Appointment?> GetByTokenAsync(string token) =>
        await _db.Appointments
            .Include(a => a.Service)
            .Include(a => a.Professional)
            .FirstOrDefaultAsync(a => a.Token == token);

    public async Task<List<Appointment>> GetByProfessionalIdAsync(int professionalId, DateTime? date = null)
    {
        var query = _db.Appointments
            .Include(a => a.Service)
            .Where(a => a.ProfessionalId == professionalId);

        if (date.HasValue)
        {
            var dayStart = date.Value.Date;
            var dayEnd = dayStart.AddDays(1);
            query = query.Where(a => a.StartUtc >= dayStart && a.StartUtc < dayEnd);
        }

        return await query.OrderBy(a => a.StartUtc).ToListAsync();
    }

    public async Task<List<Appointment>> GetByClientEmailAsync(string email) =>
        await _db.Appointments
            .Include(a => a.Professional)
            .Include(a => a.Service)
            .Where(a => a.ClientEmail == email)
            .OrderByDescending(a => a.StartUtc)
            .ToListAsync();

    public async Task<Appointment> CreateAsync(Appointment appointment)
    {
        _db.Appointments.Add(appointment);
        await _db.SaveChangesAsync();
        return appointment;
    }

    public Task UpdateAsync(Appointment appointment)
    {
        _db.Appointments.Update(appointment);
        return _db.SaveChangesAsync();
    }

    public async Task<bool> IsSlotAvailableAsync(int professionalId, DateTime startUtc, DateTime endUtc) =>
        !await _db.Appointments.AnyAsync(a =>
            a.ProfessionalId == professionalId &&
            a.Status != Core.Enums.AppointmentStatus.Cancelled &&
            a.StartUtc < endUtc &&
            a.EndUtc > startUtc);
}

public class AvailabilityRepository : IAvailabilityRepository
{
    private readonly Data.AppDbContext _db;
    public AvailabilityRepository(Data.AppDbContext db) => _db = db;

    public async Task<List<AvailabilitySlot>> GetSlotsByProfessionalIdAsync(int professionalId)
    {
        var slots = await _db.AvailabilitySlots
            .Where(a => a.ProfessionalId == professionalId && a.IsActive)
            .ToListAsync();
        return slots.OrderBy(a => a.DayOfWeek).ThenBy(a => a.StartTime).ToList();
    }

    public async Task<List<AvailabilityOverride>> GetOverridesByProfessionalIdAsync(int professionalId, DateTime? from = null)
    {
        var query = _db.AvailabilityOverrides.Where(a => a.ProfessionalId == professionalId);
        if (from.HasValue)
            query = query.Where(a => a.Date >= from.Value.Date);
        var overrides = await query.ToListAsync();
        return overrides.OrderBy(a => a.Date).ThenBy(a => a.StartTime).ToList();
    }

    public async Task SetSlotsAsync(int professionalId, List<AvailabilitySlot> slots)
    {
        var existing = await _db.AvailabilitySlots.Where(a => a.ProfessionalId == professionalId).ToListAsync();
        _db.AvailabilitySlots.RemoveRange(existing);
        await _db.AvailabilitySlots.AddRangeAsync(slots);
        await _db.SaveChangesAsync();
    }

    public async Task<AvailabilityOverride> CreateOverrideAsync(AvailabilityOverride override_)
    {
        _db.AvailabilityOverrides.Add(override_);
        await _db.SaveChangesAsync();
        return override_;
    }

    public async Task DeleteOverrideAsync(int id)
    {
        var ov = await _db.AvailabilityOverrides.FindAsync(id);
        if (ov != null)
        {
            _db.AvailabilityOverrides.Remove(ov);
            await _db.SaveChangesAsync();
        }
    }
}

public class RefreshTokenRepository : IRefreshTokenRepository
{
    private readonly Data.AppDbContext _db;
    public RefreshTokenRepository(Data.AppDbContext db) => _db = db;

    public async Task<RefreshToken?> GetByTokenAsync(string token) =>
        await _db.RefreshTokens.Include(r => r.User).FirstOrDefaultAsync(r => r.Token == token);

    public async Task CreateAsync(RefreshToken refreshToken)
    {
        _db.RefreshTokens.Add(refreshToken);
        await _db.SaveChangesAsync();
    }

    public async Task RevokeAsync(string token)
    {
        var rt = await _db.RefreshTokens.FirstOrDefaultAsync(r => r.Token == token);
        if (rt != null)
        {
            rt.RevokedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }
    }
}
