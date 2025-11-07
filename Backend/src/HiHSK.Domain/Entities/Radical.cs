namespace HiHSK.Domain.Entities;

public class Radical
{
    public int Id { get; set; }
    public string Character { get; set; } = string.Empty;
    public string Pinyin { get; set; } = string.Empty;
    public string Meaning { get; set; } = string.Empty;
    public int StrokeCount { get; set; }
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public string? AnimationUrl { get; set; }
    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<WordRadical> WordRadicals { get; set; } = new List<WordRadical>();
    public ICollection<UserRadicalProgress> UserRadicalProgresses { get; set; } = new List<UserRadicalProgress>();
}

