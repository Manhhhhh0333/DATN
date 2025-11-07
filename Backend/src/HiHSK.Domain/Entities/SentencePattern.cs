namespace HiHSK.Domain.Entities;

public class SentencePattern
{
    public int Id { get; set; }
    public int? LessonId { get; set; }
    public int? ExerciseId { get; set; } // Bài tập trong chủ đề
    public string PatternText { get; set; } = string.Empty;
    public string? Pinyin { get; set; }
    public string Meaning { get; set; } = string.Empty;
    public string? Usage { get; set; }
    public string? ExampleSentences { get; set; }
    public string? Category { get; set; }
    public int DifficultyLevel { get; set; } = 1;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Lesson? Lesson { get; set; }
    public LessonExercise? Exercise { get; set; }
    public ICollection<SentencePatternExample> SentencePatternExamples { get; set; } = new List<SentencePatternExample>();
    public ICollection<Question> Questions { get; set; } = new List<Question>();
    public ICollection<FavoriteSentencePattern> FavoriteSentencePatterns { get; set; } = new List<FavoriteSentencePattern>();
}

