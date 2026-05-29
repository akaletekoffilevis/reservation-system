using Booking.Core.Enums;
using Booking.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Booking.API.Controllers;

[ApiController]
[Route("api/pro")]
[Authorize(Roles = "Professional")]
public class ProController : ControllerBase
{
    private readonly IAppointmentRepository _appointments;
    private readonly IProfessionalRepository _pros;
    private readonly IServiceRepository _services;
    private readonly IAvailabilityRepository _avail;

    public ProController(
        IAppointmentRepository appointments,
        IProfessionalRepository pros,
        IServiceRepository services,
        IAvailabilityRepository avail)
    {
        _appointments = appointments;
        _pros = pros;
        _services = services;
        _avail = avail;
    }

    private async Task<int> GetProfessionalIdAsync()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var pro = await _pros.GetByIdAsync(userId);
        return pro?.Id ?? throw new InvalidOperationException("Professional profile not found");
    }

    [HttpGet("appointments")]
    public async Task<ActionResult> GetAppointments([FromQuery] DateTime? date)
    {
        var proId = await GetProfessionalIdAsync();
        var appointments = await _appointments.GetByProfessionalIdAsync(proId, date);
        return Ok(appointments.Select(a => new
        {
            a.Id,
            a.ClientName,
            a.ClientEmail,
            a.ClientPhone,
            a.StartUtc,
            a.EndUtc,
            Status = a.Status.ToString(),
            a.Notes,
            ServiceName = a.Service.Name,
            a.CreatedAt
        }));
    }

    [HttpGet("appointments/{id}")]
    public async Task<ActionResult> GetAppointment(int id)
    {
        var appointment = await _appointments.GetByIdAsync(id);
        if (appointment == null) return NotFound();
        return Ok(new
        {
            appointment.Id,
            appointment.ClientName,
            appointment.ClientEmail,
            appointment.ClientPhone,
            appointment.StartUtc,
            appointment.EndUtc,
            Status = appointment.Status.ToString(),
            appointment.Notes,
            ServiceName = appointment.Service.Name,
            appointment.CreatedAt
        });
    }

    [HttpPut("appointments/{id}/confirm")]
    public async Task<ActionResult> Confirm(int id)
    {
        var appointment = await _appointments.GetByIdAsync(id);
        if (appointment == null) return NotFound();
        appointment.Status = AppointmentStatus.Confirmed;
        appointment.UpdatedAt = DateTime.UtcNow;
        await _appointments.UpdateAsync(appointment);
        return Ok();
    }

    [HttpPut("appointments/{id}/cancel")]
    public async Task<ActionResult> Cancel(int id, [FromBody] Core.DTOs.CancelRequest? request)
    {
        var appointment = await _appointments.GetByIdAsync(id);
        if (appointment == null) return NotFound();
        appointment.Status = AppointmentStatus.Cancelled;
        appointment.CancellationReason = request?.Reason;
        appointment.UpdatedAt = DateTime.UtcNow;
        await _appointments.UpdateAsync(appointment);
        return Ok();
    }

    [HttpPut("appointments/{id}/complete")]
    public async Task<ActionResult> Complete(int id)
    {
        var appointment = await _appointments.GetByIdAsync(id);
        if (appointment == null) return NotFound();
        appointment.Status = AppointmentStatus.Completed;
        appointment.UpdatedAt = DateTime.UtcNow;
        await _appointments.UpdateAsync(appointment);
        return Ok();
    }

    [HttpGet("services")]
    public async Task<ActionResult> GetServices()
    {
        var proId = await GetProfessionalIdAsync();
        var services = await _services.GetByProfessionalIdAsync(proId);
        return Ok(services);
    }

    [HttpPost("services")]
    public async Task<ActionResult> CreateService(Core.DTOs.CreateServiceRequest request)
    {
        var proId = await GetProfessionalIdAsync();
        var service = new Core.Entities.Service
        {
            ProfessionalId = proId,
            Name = request.Name,
            Description = request.Description,
            DurationMinutes = request.DurationMinutes,
            Price = request.Price
        };
        service = await _services.CreateAsync(service);
        return Ok(service);
    }

    [HttpPut("services/{id}")]
    public async Task<ActionResult> UpdateService(int id, Core.DTOs.CreateServiceRequest request)
    {
        var service = await _services.GetByIdAsync(id);
        if (service == null) return NotFound();
        service.Name = request.Name;
        service.Description = request.Description;
        service.DurationMinutes = request.DurationMinutes;
        service.Price = request.Price;
        await _services.UpdateAsync(service);
        return Ok(service);
    }

    [HttpDelete("services/{id}")]
    public async Task<ActionResult> DeleteService(int id)
    {
        var service = await _services.GetByIdAsync(id);
        if (service == null) return NotFound();
        await _services.DeleteAsync(service);
        return Ok();
    }

    [HttpGet("availability")]
    public async Task<ActionResult> GetAvailability()
    {
        var proId = await GetProfessionalIdAsync();
        var slots = await _avail.GetSlotsByProfessionalIdAsync(proId);
        var overrides = await _avail.GetOverridesByProfessionalIdAsync(proId);
        return Ok(new { slots, overrides });
    }

    [HttpPut("availability")]
    public async Task<ActionResult> SetAvailability(List<Core.Entities.AvailabilitySlot> slots)
    {
        var proId = await GetProfessionalIdAsync();
        foreach (var slot in slots)
            slot.ProfessionalId = proId;
        await _avail.SetSlotsAsync(proId, slots);
        return Ok();
    }

    [HttpPost("availability/overrides")]
    public async Task<ActionResult> CreateOverride(Core.Entities.AvailabilityOverride override_)
    {
        var proId = await GetProfessionalIdAsync();
        override_.ProfessionalId = proId;
        var result = await _avail.CreateOverrideAsync(override_);
        return Ok(result);
    }

    [HttpDelete("availability/overrides/{id}")]
    public async Task<ActionResult> DeleteOverride(int id)
    {
        await _avail.DeleteOverrideAsync(id);
        return Ok();
    }
}
