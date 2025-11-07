namespace HiHSK.Application.DTOs;

public class ReadingPassageDto
{
    public int Id { get; set; }
    public int? LessonId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string PassageText { get; set; } = string.Empty;
    public string? Pinyin { get; set; }
    public string? Translation { get; set; }
    public int DifficultyLevel { get; set; } = 1;
    public int? WordCount { get; set; }
    public string? Category { get; set; }
    public string? ImageUrl { get; set; }
    public List<QuestionDto> Questions { get; set; } = new();
}

