namespace HiHSK.Domain.Entities;

public class ReadingPassageWord
{
    public int Id { get; set; }
    public int PassageId { get; set; }
    public int WordId { get; set; }
    public int PositionInText { get; set; }
    public string? Context { get; set; }

    // Navigation properties
    public ReadingPassage Passage { get; set; } = null!;
    public Word Word { get; set; } = null!;
}

