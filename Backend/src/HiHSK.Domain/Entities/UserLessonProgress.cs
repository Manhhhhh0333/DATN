namespace HiHSK.Domain.Entities;

public class UserLessonProgress
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public int? LessonId { get; set; }
    public int? ExamPaperId { get; set; }
    public int Score { get; set; }
    public int TotalQuestions { get; set; }
    public int TotalPoints { get; set; }
    public int CorrectAnswers { get; set; }
    public int WrongAnswers { get; set; }
    public DateTime CompletedAt { get; set; } = DateTime.UtcNow;
    public int? TimeSpentSeconds { get; set; }

    // Navigation properties
    public ApplicationUser User { get; set; } = null!;
    public Lesson? Lesson { get; set; }
    public ExamPaper? ExamPaper { get; set; }
    public ICollection<UserAnswer> UserAnswers { get; set; } = new List<UserAnswer>();
    public ICollection<ExamResultAnalysis> ExamResultAnalyses { get; set; } = new List<ExamResultAnalysis>();
}

