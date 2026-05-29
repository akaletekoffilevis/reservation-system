using Booking.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace Booking.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Professional> Professionals => Set<Professional>();
    public DbSet<Service> Services => Set<Service>();
    public DbSet<AvailabilitySlot> AvailabilitySlots => Set<AvailabilitySlot>();
    public DbSet<AvailabilityOverride> AvailabilityOverrides => Set<AvailabilityOverride>();
    public DbSet<Appointment> Appointments => Set<Appointment>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<NotificationPreference> NotificationPreferences => Set<NotificationPreference>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Email).HasMaxLength(255);
            e.Property(u => u.DisplayName).HasMaxLength(100);
            e.Property(u => u.PasswordHash).HasMaxLength(500);
            e.Property(u => u.Timezone).HasMaxLength(50);
        });

        modelBuilder.Entity<Professional>(e =>
        {
            e.HasIndex(p => p.Slug).IsUnique();
            e.Property(p => p.Slug).HasMaxLength(100);
            e.Property(p => p.BusinessName).HasMaxLength(200);
            e.HasOne(p => p.User)
                .WithOne(u => u.Professional)
                .HasForeignKey<Professional>(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Service>(e =>
        {
            e.Property(s => s.Name).HasMaxLength(100);
            e.Property(s => s.Price).HasColumnType("decimal(10,2)");
            e.HasOne(s => s.Professional)
                .WithMany(p => p.Services)
                .HasForeignKey(s => s.ProfessionalId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AvailabilitySlot>(e =>
        {
            e.HasOne(a => a.Professional)
                .WithMany(p => p.AvailabilitySlots)
                .HasForeignKey(a => a.ProfessionalId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AvailabilityOverride>(e =>
        {
            e.HasOne(a => a.Professional)
                .WithMany(p => p.AvailabilityOverrides)
                .HasForeignKey(a => a.ProfessionalId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Appointment>(e =>
        {
            e.HasIndex(a => a.Token).IsUnique();
            e.HasIndex(a => new { a.ProfessionalId, a.StartUtc });
            e.Property(a => a.ClientName).HasMaxLength(100);
            e.Property(a => a.ClientEmail).HasMaxLength(255);
            e.Property(a => a.Token).HasMaxLength(32);
            e.Property(a => a.ConcurrencyStamp).IsConcurrencyToken();

            e.HasOne(a => a.Professional)
                .WithMany(p => p.Appointments)
                .HasForeignKey(a => a.ProfessionalId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(a => a.Service)
                .WithMany(s => s.Appointments)
                .HasForeignKey(a => a.ServiceId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(a => a.Client)
                .WithMany()
                .HasForeignKey(a => a.ClientId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<RefreshToken>(e =>
        {
            e.HasIndex(r => r.Token).IsUnique();
            e.HasOne(r => r.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<NotificationPreference>(e =>
        {
            e.HasOne(n => n.User)
                .WithOne(u => u.NotificationPreference)
                .HasForeignKey<NotificationPreference>(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
