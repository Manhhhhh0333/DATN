namespace HiHSK.Domain.Entities;

public class WordExample
{
    public int Id { get; set; }
    public int WordId { get; set; }
    public string Character { get; set; } = string.Empty;
    public string Pinyin { get; set; } = string.Empty;
    public string Meaning { get; set; } = string.Empty;
    public string? AudioUrl { get; set; }
    public int SortOrder { get; set; }

    // Navigation properties
    public Word Word { get; set; } = null!;
}

