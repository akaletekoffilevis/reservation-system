using Booking.Core.Entities;

namespace Booking.Core.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(int id);
    Task<User?> GetByEmailAsync(string email);
    Task<User> CreateAsync(User user);
    Task<bool> EmailExistsAsync(string email);
}

public interface IProfessionalRepository
{
    Task<List<Professional>> GetAllAsync(string? search = null);
    Task<Professional?> GetBySlugAsync(string slug);
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
