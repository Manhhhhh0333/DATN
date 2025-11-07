namespace HiHSK.Domain.Entities;

public class ExamPaper
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string ExamType { get; set; } = string.Empty; // 'HSK', 'THPT'
    public int? Level { get; set; }
    public string? Description { get; set; }
    public int DurationMinutes { get; set; }
    public int TotalQuestions { get; set; }
    public int TotalPoints { get; set; }
    public int PassingScore { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public ICollection<ExamPaperQuestion> ExamPaperQuestions { get; set; } = new List<ExamPaperQuestion>();
    public ICollection<UserLessonProgress> UserLessonProgresses { get; set; } = new List<UserLessonProgress>();
    public ICollection<Leaderboard> Leaderboards { get; set; } = new List<Leaderboard>();
}

