namespace HiHSK.Domain.Entities;

public class MeasureWordExample
{
    public int Id { get; set; }
    public int MeasureWordId { get; set; }
    public string ExampleText { get; set; } = string.Empty;
    public string? Pinyin { get; set; }
    public string Translation { get; set; } = string.Empty;
    public string? Explanation { get; set; }
    public int SortOrder { get; set; }

    // Navigation properties
    public MeasureWord MeasureWord { get; set; } = null!;
}

