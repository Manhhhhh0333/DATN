namespace HiHSK.Domain.Entities;

public class Question
{
    public int Id { get; set; }
    public int? LessonId { get; set; }
    public int? ExerciseId { get; set; } // Bài tập trong chủ đề
    public int? ReadingPassageId { get; set; }
    public int? DialogueId { get; set; }
    public int? SentencePatternId { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string QuestionType { get; set; } = "CHOOSE_MEANING";
    public string? AudioUrl { get; set; }
    public int Points { get; set; } = 1;
    public int DifficultyLevel { get; set; } = 1;
    public string? Explanation { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Lesson? Lesson { get; set; }
    public LessonExercise? Exercise { get; set; }
    public ReadingPassage? ReadingPassage { get; set; }
    public Dialogue? Dialogue { get; set; }
    public SentencePattern? SentencePattern { get; set; }
    public ICollection<QuestionOption> QuestionOptions { get; set; } = new List<QuestionOption>();
    public ICollection<UserAnswer> UserAnswers { get; set; } = new List<UserAnswer>();
    public ICollection<ExamPaperQuestion> ExamPaperQuestions { get; set; } = new List<ExamPaperQuestion>();
}

