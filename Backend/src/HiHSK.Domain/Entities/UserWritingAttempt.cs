namespace HiHSK.Domain.Entities;

public class UserWritingAttempt
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public int WritingExerciseId { get; set; }
    public int? StrokeCount { get; set; }
    public int? CorrectStrokeCount { get; set; }
    public string? StrokeData { get; set; }
    public int? Score { get; set; }
    public DateTime AttemptedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ApplicationUser User { get; set; } = null!;
    public WritingExercise WritingExercise { get; set; } = null!;
}

