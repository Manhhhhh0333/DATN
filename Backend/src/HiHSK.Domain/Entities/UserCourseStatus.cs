namespace HiHSK.Domain.Entities;

public class UserCourseStatus
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public int CourseId { get; set; }
    public string Status { get; set; } = "NotStarted"; // 'NotStarted', 'InProgress', 'Completed'
    public int ProgressPercentage { get; set; } = 0;
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }

    // Navigation properties
    public ApplicationUser User { get; set; } = null!;
    public Course Course { get; set; } = null!;
}

