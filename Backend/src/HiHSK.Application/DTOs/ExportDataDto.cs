namespace HiHSK.Application.DTOs;

/// <summary>
/// DTO cho export data ra JSON
/// </summary>
public class ExportDataDto
{
    public List<CourseCategoryExportDto> CourseCategories { get; set; } = new();
    public List<CourseExportDto> Courses { get; set; } = new();
    public List<LessonExportDto> Lessons { get; set; } = new();
    public List<LessonTopicExportDto> LessonTopics { get; set; } = new();
    public List<WordExportDto> Words { get; set; } = new();
    public List<QuestionExportDto> Questions { get; set; } = new();
    public ExportMetadata Metadata { get; set; } = new();
}

public class CourseCategoryExportDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? IconUrl { get; set; }
    public int SortOrder { get; set; }
}

public class CourseExportDto
{
    public int Id { get; set; }
    public int CategoryId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public string? Level { get; set; }
    public int? HSKLevel { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
}

public class LessonExportDto
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int LessonIndex { get; set; }
    public string? Content { get; set; }
    public bool IsLocked { get; set; }
    public int? PrerequisiteLessonId { get; set; }
    public bool IsActive { get; set; }
}

public class LessonTopicExportDto
{
    public int Id { get; set; }
    public int? CourseId { get; set; }
    public int? HSKLevel { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public int TopicIndex { get; set; }
    public bool IsLocked { get; set; }
    public int? PrerequisiteTopicId { get; set; }
    public bool IsActive { get; set; }
}

public class WordExportDto
{
    public int Id { get; set; }
    public int? TopicId { get; set; }
    public string Character { get; set; } = string.Empty;
    public string Pinyin { get; set; } = string.Empty;
    public string Meaning { get; set; } = string.Empty;
    public string? AudioUrl { get; set; }
    public string? ExampleSentence { get; set; }
    public int? HSKLevel { get; set; }
    public int? Frequency { get; set; }
    public int? StrokeCount { get; set; }
}

public class QuestionExportDto
{
    public int Id { get; set; }
    public int? LessonId { get; set; }
    public int? ExerciseId { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string QuestionType { get; set; } = string.Empty;
    public string? AudioUrl { get; set; }
    public int Points { get; set; }
    public int DifficultyLevel { get; set; }
    public string? Explanation { get; set; }
    public List<QuestionOptionExportDto> Options { get; set; } = new();
}

public class QuestionOptionExportDto
{
    public int Id { get; set; }
    public string OptionText { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public int OptionOrder { get; set; }
}

public class ExportMetadata
{
    public DateTime ExportedAt { get; set; } = DateTime.UtcNow;
    public string? ExportedBy { get; set; }
    public int TotalWords { get; set; }
    public int TotalTopics { get; set; }
    public int TotalLessons { get; set; }
    public string? Version { get; set; }
}

