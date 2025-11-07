namespace HiHSK.Domain.Entities;

public class UserWordProgress
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public int WordId { get; set; }
    public string Status { get; set; } = "New"; // 'New', 'Learning', 'Mastered', 'Reviewing'
    public DateTime NextReviewDate { get; set; } = DateTime.UtcNow;
    public int ReviewCount { get; set; } = 0;
    public int CorrectCount { get; set; } = 0;
    public int WrongCount { get; set; } = 0;
    public DateTime? LastReviewedAt { get; set; }

    // Navigation properties
    public ApplicationUser User { get; set; } = null!;
    public Word Word { get; set; } = null!;
}

