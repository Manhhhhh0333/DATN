namespace HiHSK.Domain.Entities;

public class Lesson
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int LessonIndex { get; set; }
    public string? Content { get; set; }
    public bool IsLocked { get; set; } = true;
    public int? PrerequisiteLessonId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public Course Course { get; set; } = null!;
    public Lesson? PrerequisiteLesson { get; set; }
    public ICollection<Lesson> PrerequisiteForLessons { get; set; } = new List<Lesson>();
    public ICollection<Word> Words { get; set; } = new List<Word>();
    public ICollection<Question> Questions { get; set; } = new List<Question>();
    public ICollection<UserLessonProgress> UserLessonProgresses { get; set; } = new List<UserLessonProgress>();
    public ICollection<UserLessonStatus> UserLessonStatuses { get; set; } = new List<UserLessonStatus>();
    public ICollection<Dialogue> Dialogues { get; set; } = new List<Dialogue>();
    public ICollection<ReadingPassage> ReadingPassages { get; set; } = new List<ReadingPassage>();
    public ICollection<SentencePattern> SentencePatterns { get; set; } = new List<SentencePattern>();
    public ICollection<WritingExercise> WritingExercises { get; set; } = new List<WritingExercise>();
}

