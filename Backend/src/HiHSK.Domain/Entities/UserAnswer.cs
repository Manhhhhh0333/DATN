namespace HiHSK.Domain.Entities;

public class UserAnswer
{
    public int Id { get; set; }
    public int UserProgressId { get; set; }
    public int QuestionId { get; set; }
    public int? SelectedOptionId { get; set; }
    public string? UserAnswerText { get; set; }
    public bool IsCorrect { get; set; }
    public int PointsEarned { get; set; }
    public int? TimeSpentSeconds { get; set; }

    // Navigation properties
    public UserLessonProgress UserProgress { get; set; } = null!;
    public Question Question { get; set; } = null!;
    public QuestionOption? SelectedOption { get; set; }
}

