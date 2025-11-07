namespace HiHSK.Domain.Entities;

public class ReadingPassage
{
    public int Id { get; set; }
    public int? LessonId { get; set; }
    public int? ExerciseId { get; set; } // Bài tập trong chủ đề
    public string Title { get; set; } = string.Empty;
    public string PassageText { get; set; } = string.Empty;
    public string? Pinyin { get; set; }
    public string? Translation { get; set; }
    public int DifficultyLevel { get; set; } = 1;
    public int? WordCount { get; set; }
    public string? Category { get; set; }
    public string? ImageUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Lesson? Lesson { get; set; }
    public LessonExercise? Exercise { get; set; }
    public ICollection<ReadingPassageWord> ReadingPassageWords { get; set; } = new List<ReadingPassageWord>();
    public ICollection<Question> Questions { get; set; } = new List<Question>();
    public ICollection<UserReadingProgress> UserReadingProgresses { get; set; } = new List<UserReadingProgress>();
}

