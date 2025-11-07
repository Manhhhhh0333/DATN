namespace HiHSK.Domain.Entities;

public class UserRadicalProgress
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public int RadicalId { get; set; }
    public string Status { get; set; } = "NotStarted"; // 'NotStarted', 'Learning', 'Mastered'
    public int PracticeCount { get; set; } = 0;
    public int? BestScore { get; set; }
    public DateTime? LastPracticedAt { get; set; }
    public DateTime? MasteredAt { get; set; }

    // Navigation properties
    public ApplicationUser User { get; set; } = null!;
    public Radical Radical { get; set; } = null!;
}

