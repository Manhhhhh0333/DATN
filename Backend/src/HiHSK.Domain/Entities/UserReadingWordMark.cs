namespace HiHSK.Domain.Entities;

public class UserReadingWordMark
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public int PassageId { get; set; }
    public int WordId { get; set; }
    public string MarkType { get; set; } = "Unknown"; // 'Known', 'Unknown', 'Learned'
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ApplicationUser User { get; set; } = null!;
    public ReadingPassage Passage { get; set; } = null!;
    public Word Word { get; set; } = null!;
}

