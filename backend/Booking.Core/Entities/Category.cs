using System.Text.Json.Serialization;

namespace Booking.Core.Entities;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Icon { get; set; }
    public int? ParentCategoryId { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [JsonIgnore] public Category? ParentCategory { get; set; }
    [JsonIgnore] public ICollection<Category> SubCategories { get; set; } = new List<Category>();
    [JsonIgnore] public ICollection<Professional> Professionals { get; set; } = new List<Professional>();
}
