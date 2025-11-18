namespace HiHSK.Application.DTOs;

public class LessonExerciseListDto
{
    public int Id { get; set; }
    public int TopicId { get; set; }
    public string ExerciseType { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int ExerciseIndex { get; set; }
    public bool IsLocked { get; set; }
    public bool IsCompleted { get; set; }
    public string ExerciseTypeName { get; set; } = string.Empty;
}

public class LessonExerciseDto : LessonExerciseListDto
{
    public int? PrerequisiteExerciseId { get; set; }
    public List<QuestionDto>? Questions { get; set; }
    public List<DialogueDto>? Dialogues { get; set; }
    public List<ReadingPassageDto>? ReadingPassages { get; set; }
    public List<SentencePatternDto>? SentencePatterns { get; set; }
    public List<WordDto>? Words { get; set; }
}

