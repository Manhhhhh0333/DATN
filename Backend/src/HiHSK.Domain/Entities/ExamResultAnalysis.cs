namespace HiHSK.Domain.Entities;

public class ExamResultAnalysis
{
    public int Id { get; set; }
    public int UserProgressId { get; set; }
    public string SkillType { get; set; } = string.Empty; // 'Listening', 'Reading', 'Writing', 'Overall'
    public int Score { get; set; }
    public int MaxScore { get; set; }
    public int CorrectCount { get; set; }
    public int WrongCount { get; set; }
    public int? AverageTimeSeconds { get; set; }
    public string? Strengths { get; set; }
    public string? Weaknesses { get; set; }
    public string? Recommendations { get; set; }

    // Navigation properties
    public UserLessonProgress UserProgress { get; set; } = null!;
}

