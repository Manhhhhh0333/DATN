namespace HiHSK.Domain.Entities;

public class MeasureWord
{
    public int Id { get; set; }
    public string Character { get; set; } = string.Empty;
    public string Pinyin { get; set; } = string.Empty;
    public string Meaning { get; set; } = string.Empty;
    public string? UsageDescription { get; set; }
    public string? Category { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<MeasureWordExample> MeasureWordExamples { get; set; } = new List<MeasureWordExample>();
    public ICollection<WordMeasureWord> WordMeasureWords { get; set; } = new List<WordMeasureWord>();
}

