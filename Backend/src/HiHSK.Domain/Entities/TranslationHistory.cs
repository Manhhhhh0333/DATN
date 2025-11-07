namespace HiHSK.Domain.Entities;

public class TranslationHistory
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string SourceText { get; set; } = string.Empty;
    public string SourceLanguage { get; set; } = string.Empty;
    public string TranslatedText { get; set; } = string.Empty;
    public string TargetLanguage { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ApplicationUser User { get; set; } = null!;
}

