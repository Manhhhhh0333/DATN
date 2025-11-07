namespace HiHSK.Domain.Entities;

public class FavoriteSentencePattern
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public int SentencePatternId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ApplicationUser User { get; set; } = null!;
    public SentencePattern SentencePattern { get; set; } = null!;
}

