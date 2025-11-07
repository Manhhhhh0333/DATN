namespace HiHSK.Domain.Entities;

public class UserReadingProgress
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public int PassageId { get; set; }
    public string Status { get; set; } = "NotStarted"; // 'NotStarted', 'Reading', 'Completed'
    public int? ReadingTimeSeconds { get; set; }
    public int WordsMarkedCount { get; set; } = 0;
    public DateTime? LastAccessedAt { get; set; }
    public DateTime? CompletedAt { get; set; }

    // Navigation properties
    public ApplicationUser User { get; set; } = null!;
    public ReadingPassage Passage { get; set; } = null!;
}

