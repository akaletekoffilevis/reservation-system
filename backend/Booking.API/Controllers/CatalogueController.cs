using Microsoft.AspNetCore.Mvc;
using Booking.Core.DTOs;
using Booking.Core.Interfaces;

namespace Booking.API.Controllers;

[ApiController]
[Route("api/catalogue")]
public class CatalogueController : ControllerBase
{
    private readonly ICategoryService _categories;
    private readonly IReviewService _reviews;

    public CatalogueController(ICategoryService categories, IReviewService reviews)
    {
        _categories = categories;
        _reviews = reviews;
    }

    [HttpGet("categories")]
    public async Task<ActionResult<List<CategoryDto>>> GetCategories()
    {
        return Ok(await _categories.GetAllCategoriesAsync());
    }

    [HttpGet("professionals/{professionalId}/reviews")]
    public async Task<ActionResult<List<ReviewDto>>> GetReviews(int professionalId)
    {
        return Ok(await _reviews.GetProfessionalReviewsAsync(professionalId));
    }

    [HttpPost("reviews")]
    public async Task<ActionResult<ReviewDto>> CreateReview([FromBody] CreateReviewRequest request)
    {
        var clientName = User.FindFirst("displayName")?.Value ?? "Anonyme";
        var clientEmail = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
        return Ok(await _reviews.CreateReviewAsync(request, clientName, clientEmail));
    }
}
