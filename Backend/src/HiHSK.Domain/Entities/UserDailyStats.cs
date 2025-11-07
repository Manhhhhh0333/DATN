namespace HiHSK.Domain.Entities;

public class UserDailyStats
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public DateTime StatDate { get; set; }
    public int WordsLearned { get; set; } = 0;
    public int WordsReviewed { get; set; } = 0;
    public int LessonsCompleted { get; set; } = 0;
    public int QuestionsAnswered { get; set; } = 0;
    public int CorrectAnswers { get; set; } = 0;
    public int StudyTimeMinutes { get; set; } = 0;

    // Navigation properties
    public ApplicationUser User { get; set; } = null!;
}

