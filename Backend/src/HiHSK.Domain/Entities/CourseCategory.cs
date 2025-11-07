namespace HiHSK.Domain.Entities;

public class CourseCategory
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? IconUrl { get; set; }
    public int SortOrder { get; set; }

    // Navigation properties
    public ICollection<Course> Courses { get; set; } = new List<Course>();
}

