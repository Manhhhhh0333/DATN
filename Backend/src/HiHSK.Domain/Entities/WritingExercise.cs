namespace HiHSK.Domain.Entities;

public class WritingExercise
{
    public int Id { get; set; }
    public int? LessonId { get; set; }
    public int WordId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Instructions { get; set; }
    public string? StrokeOrderGuide { get; set; }
    public string? AnimationUrl { get; set; }
    public int ExpectedStrokeCount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Lesson? Lesson { get; set; }
    public Word Word { get; set; } = null!;
    public ICollection<UserWritingProgress> UserWritingProgresses { get; set; } = new List<UserWritingProgress>();
    public ICollection<UserWritingAttempt> UserWritingAttempts { get; set; } = new List<UserWritingAttempt>();
}

