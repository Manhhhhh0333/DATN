namespace HiHSK.Application.DTOs;

public class LessonDto
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int LessonIndex { get; set; }
    public string? Content { get; set; }
    public bool IsLocked { get; set; }
    public bool IsCompleted { get; set; }
    public int? PrerequisiteLessonId { get; set; }
    
    // Nội dung bài học theo cấu trúc: Words -> Grammar -> Reading -> Quiz
    public List<WordDto> Words { get; set; } = new();
    public List<SentencePatternDto> SentencePatterns { get; set; } = new(); // Grammar
    public List<ReadingPassageDto> ReadingPassages { get; set; } = new();
    public List<DialogueDto> Dialogues { get; set; } = new();
    public List<QuestionDto> Questions { get; set; } = new(); // Quiz
}

public class LessonListDto
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int LessonIndex { get; set; }
    public bool IsLocked { get; set; }
    public bool IsCompleted { get; set; }
    public int? PrerequisiteLessonId { get; set; }
    public int TotalWords { get; set; }
    public int TotalQuestions { get; set; }
}





