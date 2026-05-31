using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Booking.Core.DTOs;
using Booking.Core.Interfaces;

namespace Booking.API.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _admin;
    private readonly IReviewService _reviews;
    private readonly IEmailService _email;

    public AdminController(IAdminService admin, IReviewService reviews, IEmailService email)
    {
        _admin = admin; _reviews = reviews; _email = email;
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<AdminDashboardStatsDto>> GetDashboard()
    {
        return Ok(await _admin.GetDashboardStatsAsync());
    }

    [HttpGet("professionals")]
    public async Task<ActionResult<List<ProfessionalDto>>> GetProfessionals()
    {
        return Ok(await _admin.GetAllProfessionalsAsync());
    }

    [HttpPut("professionals/{id}/toggle")]
    public async Task<ActionResult> ToggleProfessional(int id, [FromBody] ToggleProfessionalRequest request)
    {
        await _admin.ToggleProfessionalStatusAsync(id, request.IsActive);
        return NoContent();
    }

    [HttpGet("reviews/pending")]
    public async Task<ActionResult<List<ReviewDto>>> GetPendingReviews()
    {
        return Ok(await _reviews.GetPendingReviewsAsync());
    }

    [HttpPost("reviews/{id}/approve")]
    public async Task<ActionResult<ReviewDto>> ApproveReview(int id)
    {
        return Ok(await _reviews.ApproveReviewAsync(id));
    }

    [HttpPost("reviews/{id}/reject")]
    public async Task<ActionResult> RejectReview(int id)
    {
        await _reviews.RejectReviewAsync(id);
        return NoContent();
    }
}

public class ToggleProfessionalRequest
{
    public bool IsActive { get; set; }
}
