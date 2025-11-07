namespace HiHSK.Domain.Entities;

public class UserPronunciationAttempt
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public int? WordId { get; set; }
    public string? SentenceText { get; set; }
    public string? AudioUrl { get; set; }
    public int? Score { get; set; }
    public decimal? ToneAccuracy { get; set; }
    public decimal? PronunciationAccuracy { get; set; }
    public string? Feedback { get; set; }
    public string? WaveformData { get; set; }
    public DateTime AttemptedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ApplicationUser User { get; set; } = null!;
    public Word? Word { get; set; }
}

