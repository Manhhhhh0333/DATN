namespace HiHSK.Domain.Entities;

public class DialogueSentence
{
    public int Id { get; set; }
    public int DialogueId { get; set; }
    public string SentenceText { get; set; } = string.Empty;
    public string? Pinyin { get; set; }
    public string? Translation { get; set; }
    public string? Speaker { get; set; }
    public int SentenceIndex { get; set; }
    public string? AudioUrl { get; set; }

    // Navigation properties
    public Dialogue Dialogue { get; set; } = null!;
}

