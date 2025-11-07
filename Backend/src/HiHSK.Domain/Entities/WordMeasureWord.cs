namespace HiHSK.Domain.Entities;

public class WordMeasureWord
{
    public int WordId { get; set; }
    public int MeasureWordId { get; set; }

    // Navigation properties
    public Word Word { get; set; } = null!;
    public MeasureWord MeasureWord { get; set; } = null!;
}

