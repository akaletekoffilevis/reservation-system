using Booking.Core.Entities;
using Booking.Core.Enums;
using Booking.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Booking.Infrastructure.Services;

public static class DataSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        await db.Database.EnsureCreatedAsync();

        if (await db.Users.AnyAsync()) return;

        // Admin user
        var admin = new User
        {
            Email = "koffilevis21@gmail.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
            DisplayName = "Admin Booking",
            Role = UserRole.Admin,
            Timezone = "Europe/Paris",
            EmailConfirmed = true
        };
        db.Users.Add(admin);
        await db.SaveChangesAsync();

        // Professionals
        var pros = new[]
        {
            ("Sophie Martin", "Coiffure Sophie", "Coiffeuse professionnelle depuis 15 ans", "Paris", "sophie@coiffure.fr", "+33 6 11 22 33 44"),
            ("Thomas Bernard", "Kiné Thomas", "Kinésithérapeute du sport", "Lyon", "thomas@kine.fr", "+33 6 22 33 44 55"),
            ("Marie Dubois", "Bien-être Marie", "Massages relaxants et soins du visage", "Marseille", "marie@bienetre.fr", "+33 6 33 44 55 66"),
            ("Lucas Petit", "Coach Lucas", "Coach sportif certifié", "Bordeaux", "lucas@coach.fr", "+33 6 44 55 66 77"),
            ("Emma Leroy", "Docteur Emma", "Médecine générale", "Lille", "emma@medecin.fr", "+33 6 55 66 77 88"),
        };

        var servicesData = new[]
        {
            new[] { ("Coupe femme", 45, 45m), ("Coupe homme", 30, 25m), ("Brushing", 30, 30m), ("Coloration", 90, 65m) },
            new[] { ("Bilan kiné", 45, 50m), ("Séance de rééducation", 30, 35m), ("Massage thérapeutique", 60, 60m) },
            new[] { ("Massage relaxant", 60, 70m), ("Soin visage", 45, 55m), ("Gommage corporel", 45, 50m) },
            new[] { ("Coaching individuel", 60, 50m), ("Bilan sportif", 45, 40m), ("Préparation marathon", 90, 80m) },
            new[] { ("Consultation générale", 30, 30m), ("Consultation longue", 45, 45m), ("Téléconsultation", 20, 25m) },
        };

        var availabilityData = new[]
        {
            new[] { (1, "09:00", "18:00"), (2, "09:00", "18:00"), (3, "09:00", "18:00"), (4, "09:00", "18:00"), (5, "09:00", "17:00"), (6, "09:00", "13:00") },
            new[] { (1, "08:00", "19:00"), (2, "08:00", "19:00"), (3, "08:00", "19:00"), (4, "08:00", "19:00"), (5, "08:00", "17:00") },
            new[] { (1, "10:00", "19:00"), (2, "10:00", "19:00"), (3, "10:00", "19:00"), (4, "10:00", "19:00"), (5, "10:00", "18:00"), (6, "10:00", "16:00") },
            new[] { (1, "07:00", "12:00"), (2, "07:00", "12:00"), (3, "07:00", "12:00"), (4, "07:00", "12:00"), (5, "07:00", "12:00") },
            new[] { (1, "09:00", "17:00"), (2, "09:00", "17:00"), (3, "09:00", "17:00"), (4, "09:00", "17:00"), (5, "09:00", "16:00") },
        };

        // Categories
        var categories = new[]
        {
            new Category { Name = "Coiffure & Barbier", Icon = "💇", DisplayOrder = 1 },
            new Category { Name = "Santé & Bien-être", Icon = "🧘", DisplayOrder = 2 },
            new Category { Name = "Sport & Fitness", Icon = "🏋️", DisplayOrder = 3 },
            new Category { Name = "Médecine", Icon = "🩺", DisplayOrder = 4 },
        };
        db.Categories.AddRange(categories);
        await db.SaveChangesAsync();

        for (int i = 0; i < pros.Length; i++)
        {
            var (name, business, desc, city, email, phone) = pros[i];

            var user = new User
            {
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                DisplayName = name,
                Phone = phone,
                Timezone = "Europe/Paris",
                Role = UserRole.Professional,
                EmailConfirmed = true
            };
            db.Users.Add(user);
            await db.SaveChangesAsync();

            var catId = i switch { 0 => 1, 1 => 2, 2 => 2, 3 => 3, _ => 4 };
            var slug = business.ToLower().Replace(" ", "-") + "-" + (1000 + i);
            var pro = new Professional
            {
                UserId = user.Id,
                BusinessName = business,
                Slug = slug,
                Description = desc,
                City = city,
                Phone = phone,
                Address = $"1 rue {name.Split(' ')[0]}, {city}",
                CategoryId = catId,
                IsActive = true
            };
            db.Professionals.Add(pro);
            await db.SaveChangesAsync();

            foreach (var (svcName, dur, price) in servicesData[i])
            {
                db.Services.Add(new Service
                {
                    ProfessionalId = pro.Id,
                    Name = svcName,
                    DurationMinutes = dur,
                    Price = price,
                    IsActive = true
                });
            }
            await db.SaveChangesAsync();

            foreach (var (day, start, end) in availabilityData[i])
            {
                db.AvailabilitySlots.Add(new AvailabilitySlot
                {
                    ProfessionalId = pro.Id,
                    DayOfWeek = (DayOfWeek)day,
                    StartTime = TimeSpan.Parse(start),
                    EndTime = TimeSpan.Parse(end),
                    IsActive = true
                });
            }
            await db.SaveChangesAsync();
        }

        // Sample appointment
        var firstPro = await db.Professionals.FirstAsync();
        var firstService = await db.Services.FirstAsync();
        db.Appointments.Add(new Appointment
        {
            ProfessionalId = firstPro.Id,
            ServiceId = firstService.Id,
            ClientName = "Jean Dupont",
            ClientEmail = "jean@example.fr",
            ClientPhone = "+33 6 99 88 77 66",
            StartUtc = DateTime.UtcNow.Date.AddDays(1).AddHours(10),
            EndUtc = DateTime.UtcNow.Date.AddDays(1).AddHours(10).AddMinutes(firstService.DurationMinutes),
            Status = AppointmentStatus.Pending,
            Token = "demo-token-123456"
        });
        await db.SaveChangesAsync();
    }
}
