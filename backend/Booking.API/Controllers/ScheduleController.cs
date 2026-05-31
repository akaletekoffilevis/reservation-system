using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Booking.Core.DTOs;
using Booking.Core.Interfaces;

namespace Booking.API.Controllers;

[ApiController]
[Route("api/pro")]
[Authorize(Roles = "Professional")]
public class ScheduleController : ControllerBase
{
    private readonly ITimeOffService _timeOffs;
    private readonly IRecurringScheduleService _schedules;

    public ScheduleController(ITimeOffService timeOffs, IRecurringScheduleService schedules)
    {
        _timeOffs = timeOffs;
        _schedules = schedules;
    }

    // ─── Time Off / Cong├®s ───

    [HttpGet("timeoffs")]
    public async Task<ActionResult<List<TimeOffDto>>> GetTimeOffs()
    {
        var proId = GetProfessionalId();
        return Ok(await _timeOffs.GetProfessionalTimeOffsAsync(proId));
    }

    [HttpPost("timeoffs")]
    public async Task<ActionResult<TimeOffDto>> CreateTimeOff([FromBody] CreateTimeOffRequest request)
    {
        var proId = GetProfessionalId();
        return Ok(await _timeOffs.CreateTimeOffAsync(proId, request));
    }

    [HttpDelete("timeoffs/{id}")]
    public async Task<ActionResult> CancelTimeOff(int id)
    {
        await _timeOffs.CancelTimeOffAsync(id);
        return NoContent();
    }

    // ─── Recurring Schedules / Plages tournantes ───

    [HttpGet("recurring-schedules")]
    public async Task<ActionResult<List<RecurringScheduleDto>>> GetSchedules()
    {
        var proId = GetProfessionalId();
        return Ok(await _schedules.GetProfessionalSchedulesAsync(proId));
    }

    [HttpPost("recurring-schedules")]
    public async Task<ActionResult<RecurringScheduleDto>> CreateSchedule([FromBody] CreateRecurringScheduleRequest request)
    {
        var proId = GetProfessionalId();
        return Ok(await _schedules.CreateScheduleAsync(proId, request));
    }

    [HttpDelete("recurring-schedules/{id}")]
    public async Task<ActionResult> DeleteSchedule(int id)
    {
        await _schedules.DeleteScheduleAsync(id);
        return NoContent();
    }

    private int GetProfessionalId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(claim, out var id) ? id : 0;
    }
}
