namespace HiHSK.Domain.Entities;

/// <summary>
/// Chủ đề trong giáo trình HSK (ví dụ: Gia đình, Màu sắc, Động vật...)
/// </summary>
public class LessonTopic
{
    public int Id { get; set; }
    public int? CourseId { get; set; } // Có thể null nếu chỉ dùng HSKLevel
    public int? HSKLevel { get; set; } // HSK Level (1-6)
    public string Title { get; set; } = string.Empty; // Tên chủ đề
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public int TopicIndex { get; set; } // Thứ tự chủ đề trong HSK Level
    public bool IsLocked { get; set; } = true;
    public int? PrerequisiteTopicId { get; set; } // Chủ đề trước đó cần hoàn thành
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public Course? Course { get; set; }
    public LessonTopic? PrerequisiteTopic { get; set; }
    public ICollection<LessonTopic> PrerequisiteForTopics { get; set; } = new List<LessonTopic>();
    public ICollection<LessonExercise> Exercises { get; set; } = new List<LessonExercise>();
    public ICollection<Word> Words { get; set; } = new List<Word>(); // Từ vựng của chủ đề
}

