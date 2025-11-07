namespace HiHSK.Application.DTOs;

public class DialogueDto
{
    public int Id { get; set; }
    public int? LessonId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string DialogueText { get; set; } = string.Empty;
    public string? Pinyin { get; set; }
    public string? Translation { get; set; }
    public string? AudioUrl { get; set; }
    public int DifficultyLevel { get; set; } = 1;
    public string? Category { get; set; }
    public List<QuestionDto> Questions { get; set; } = new();
}

