namespace HiHSK.Domain.Entities;

public class Dialogue
{
    public int Id { get; set; }
    public int? LessonId { get; set; }
    public int? ExerciseId { get; set; } // Bài tập trong chủ đề
    public string Title { get; set; } = string.Empty;
    public string DialogueText { get; set; } = string.Empty;
    public string? Pinyin { get; set; }
    public string? Translation { get; set; }
    public string? AudioUrl { get; set; }
    public string? SceneDescription { get; set; }
    public string? Category { get; set; }
    public int DifficultyLevel { get; set; } = 1;
    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Lesson? Lesson { get; set; }
    public LessonExercise? Exercise { get; set; }
    public ICollection<DialogueSentence> DialogueSentences { get; set; } = new List<DialogueSentence>();
    public ICollection<Question> Questions { get; set; } = new List<Question>();
    public ICollection<UserDialogueProgress> UserDialogueProgresses { get; set; } = new List<UserDialogueProgress>();
}

