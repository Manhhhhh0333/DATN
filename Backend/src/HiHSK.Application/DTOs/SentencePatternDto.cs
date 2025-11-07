namespace HiHSK.Application.DTOs;

public class SentencePatternDto
{
    public int Id { get; set; }
    public int? LessonId { get; set; }
    public string PatternText { get; set; } = string.Empty;
    public string? Pinyin { get; set; }
    public string Meaning { get; set; } = string.Empty;
    public string? Usage { get; set; }
    public string? ExampleSentences { get; set; }
    public string? Category { get; set; }
    public int DifficultyLevel { get; set; } = 1;
}

