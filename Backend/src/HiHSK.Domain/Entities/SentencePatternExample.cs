namespace HiHSK.Domain.Entities;

public class SentencePatternExample
{
    public int Id { get; set; }
    public int SentencePatternId { get; set; }
    public string ExampleText { get; set; } = string.Empty;
    public string? Pinyin { get; set; }
    public string Translation { get; set; } = string.Empty;
    public string? AudioUrl { get; set; }
    public int SortOrder { get; set; }

    // Navigation properties
    public SentencePattern SentencePattern { get; set; } = null!;
}

