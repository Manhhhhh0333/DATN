namespace HiHSK.Domain.Entities;

public class UserWritingProgress
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public int WritingExerciseId { get; set; }
    public int AttemptsCount { get; set; } = 0;
    public int? BestScore { get; set; }
    public DateTime? LastAttemptAt { get; set; }
    public bool IsCompleted { get; set; } = false;

    // Navigation properties
    public ApplicationUser User { get; set; } = null!;
    public WritingExercise WritingExercise { get; set; } = null!;
}

