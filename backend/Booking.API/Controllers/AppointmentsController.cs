using Booking.Core.DTOs;
using Booking.Core.Entities;
using Booking.Core.Enums;
using Booking.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Booking.API.Hubs;

namespace Booking.API.Controllers;

[ApiController]
[Route("api/appointments")]
public class AppointmentsController : ControllerBase
{
    private readonly IAppointmentRepository _appointments;
    private readonly IProfessionalRepository _pros;
    private readonly IServiceRepository _services;
    private readonly IHubContext<PlanningHub> _planningHub;

    public AppointmentsController(
        IAppointmentRepository appointments,
        IProfessionalRepository pros,
        IServiceRepository services,
        IHubContext<PlanningHub> planningHub)
    {
        _appointments = appointments;
        _pros = pros;
        _services = services;
        _planningHub = planningHub;
    }

    [HttpPost]
    public async Task<ActionResult> Create(CreateAppointmentRequest request)
    {
        var service = await _services.GetByIdAsync(request.ServiceId);
        if (service == null || service.ProfessionalId != request.ProfessionalId)
            return BadRequest(new { message = "Invalid service" });

        var endUtc = request.StartUtc.AddMinutes(service.DurationMinutes);

        var available = await _appointments.IsSlotAvailableAsync(
            request.ProfessionalId, request.StartUtc, endUtc);

        if (!available)
            return Conflict(new { message = "Time slot is not available" });

        var appointment = new Appointment
        {
            ProfessionalId = request.ProfessionalId,
            ServiceId = request.ServiceId,
            ClientName = request.ClientName,
            ClientEmail = request.ClientEmail,
            ClientPhone = request.ClientPhone,
            StartUtc = request.StartUtc,
            EndUtc = endUtc,
            Notes = request.Notes
        };

        appointment = await _appointments.CreateAsync(appointment);

        await PlanningHub.NotifySlotBooked(_planningHub, request.ProfessionalId, request.StartUtc, endUtc);

        return Ok(new
        {
            appointment.Id,
            appointment.Token,
            appointment.ClientName,
            appointment.StartUtc,
            appointment.EndUtc,
            appointment.Status,
            ServiceName = service.Name
        });
    }

    [HttpGet("{token}")]
    public async Task<ActionResult> GetByToken(string token)
    {
        var appointment = await _appointments.GetByTokenAsync(token);
        if (appointment == null) return NotFound();
        return Ok(new
        {
            appointment.Id,
            appointment.Token,
            appointment.ClientName,
            appointment.ClientEmail,
            appointment.ClientPhone,
            appointment.StartUtc,
            appointment.EndUtc,
            Status = appointment.Status.ToString(),
            appointment.Notes,
            ServiceName = appointment.Service.Name,
            BusinessName = appointment.Professional.BusinessName,
            appointment.CreatedAt
        });
    }

    [HttpPut("{token}/cancel")]
    public async Task<ActionResult> Cancel(string token, CancelRequest? request)
    {
        var appointment = await _appointments.GetByTokenAsync(token);
        if (appointment == null) return NotFound();

        if (appointment.Status == AppointmentStatus.Cancelled)
            return BadRequest(new { message = "Already cancelled" });

        appointment.Status = AppointmentStatus.Cancelled;
        appointment.CancellationReason = request?.Reason;
        appointment.UpdatedAt = DateTime.UtcNow;
        await _appointments.UpdateAsync(appointment);

        await PlanningHub.NotifySlotFreed(_planningHub, appointment.ProfessionalId, appointment.StartUtc, appointment.EndUtc);

        return Ok();
    }

    [HttpPut("{token}/reschedule")]
    public async Task<ActionResult> Reschedule(string token, RescheduleRequest request)
    {
        var appointment = await _appointments.GetByTokenAsync(token);
        if (appointment == null) return NotFound();

        if (appointment.Status == AppointmentStatus.Cancelled)
            return BadRequest(new { message = "Cannot reschedule cancelled appointment" });

        var service = await _services.GetByIdAsync(appointment.ServiceId);
        if (service == null) return BadRequest();

        var endUtc = request.NewStartUtc.AddMinutes(service.DurationMinutes);

        var available = await _appointments.IsSlotAvailableAsync(
            appointment.ProfessionalId, request.NewStartUtc, endUtc);

        if (!available)
            return Conflict(new { message = "Time slot is not available" });

        var oldStart = appointment.StartUtc;
        var oldEnd = appointment.EndUtc;

        appointment.StartUtc = request.NewStartUtc;
        appointment.EndUtc = endUtc;
        appointment.UpdatedAt = DateTime.UtcNow;
        await _appointments.UpdateAsync(appointment);

        await PlanningHub.NotifySlotFreed(_planningHub, appointment.ProfessionalId, oldStart, oldEnd);
        await PlanningHub.NotifySlotBooked(_planningHub, appointment.ProfessionalId, request.NewStartUtc, endUtc);

        return Ok();
    }
}
