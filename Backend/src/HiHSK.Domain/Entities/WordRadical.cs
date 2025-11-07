namespace HiHSK.Domain.Entities;

public class WordRadical
{
    public int WordId { get; set; }
    public int RadicalId { get; set; }

    // Navigation properties
    public Word Word { get; set; } = null!;
    public Radical Radical { get; set; } = null!;
}

