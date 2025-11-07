namespace HiHSK.Domain.Entities;

public class Leaderboard
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public int ExamPaperId { get; set; }
    public int Score { get; set; }
    public int TotalPoints { get; set; }
    public int? Ranking { get; set; }
    public DateTime CompletedAt { get; set; }
    public int? TimeSpentSeconds { get; set; }

    // Navigation properties
    public ApplicationUser User { get; set; } = null!;
    public ExamPaper ExamPaper { get; set; } = null!;
}

