namespace HiHSK.Application.DTOs;

public class LessonTopicDto
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
    public int TotalExercises { get; set; }
    public int TotalWords { get; set; }
    public int ProgressPercentage { get; set; }
}

public class LessonTopicListDto
{
    public int Id { get; set; }
    public int? HSKLevel { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public int TopicIndex { get; set; }
    public bool IsLocked { get; set; }
    public int TotalExercises { get; set; }
    public int TotalWords { get; set; }
    public int ProgressPercentage { get; set; }
}

