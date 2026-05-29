using Booking.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Booking.API.Controllers;

[ApiController]
[Route("api/professionals")]
public class ProfessionalsController : ControllerBase
{
    private readonly IProfessionalRepository _pros;
    private readonly IAvailabilityRepository _avail;

    public ProfessionalsController(IProfessionalRepository pros, IAvailabilityRepository avail)
    {
        _pros = pros;
        _avail = avail;
    }

    [HttpGet]
    public async Task<ActionResult> GetAll([FromQuery] string? search)
    {
        var pros = await _pros.GetAllAsync(search);
        return Ok(pros.Select(p => new
        {
            p.Id,
            p.Slug,
            p.BusinessName,
            p.Description,
            p.City,
            p.Address,
            p.Phone,
            Services = p.Services.Where(s => s.IsActive).Select(s => new
            {
                s.Id, s.Name, s.DurationMinutes, s.Price
            })
        }));
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult> GetBySlug(string slug)
    {
        var pro = await _pros.GetBySlugAsync(slug);
        if (pro == null) return NotFound();
        return Ok(new
        {
            pro.Id,
            pro.Slug,
            pro.BusinessName,
            pro.Description,
            pro.City,
            pro.Address,
            pro.Phone,
            Services = pro.Services.Where(s => s.IsActive).Select(s => new
            {
                s.Id, s.Name, s.Description, s.DurationMinutes, s.Price
            })
        });
    }

    [HttpGet("{professionalId}/services")]
    public async Task<ActionResult> GetServices(int professionalId)
    {
        var pro = await _pros.GetByIdAsync(professionalId);
        if (pro == null) return NotFound();
        return Ok(pro.Services.Where(s => s.IsActive).Select(s => new
        {
            s.Id, s.Name, s.Description, s.DurationMinutes, s.Price
        }));
    }

    [HttpGet("{professionalId}/availability")]
    public async Task<ActionResult> GetAvailability(int professionalId, [FromQuery] DateTime? date)
    {
        var pro = await _pros.GetByIdAsync(professionalId);
        if (pro == null) return NotFound();

        var slots = await _avail.GetSlotsByProfessionalIdAsync(professionalId);
        var overrides = await _avail.GetOverridesByProfessionalIdAsync(professionalId, date);

        return Ok(new { slots, overrides });
    }
}
