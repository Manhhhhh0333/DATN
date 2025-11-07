namespace HiHSK.Domain.Entities;

/// <summary>
/// Các phần học trong một chủ đề
/// </summary>
public class LessonExercise
{
    public int Id { get; set; }
    public int TopicId { get; set; }
    public string ExerciseType { get; set; } = string.Empty; // Loại bài tập
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int ExerciseIndex { get; set; } // Thứ tự trong chủ đề
    public bool IsLocked { get; set; } = true;
    public int? PrerequisiteExerciseId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public LessonTopic Topic { get; set; } = null!;
    public LessonExercise? PrerequisiteExercise { get; set; }
    public ICollection<LessonExercise> PrerequisiteForExercises { get; set; } = new List<LessonExercise>();
    
    // Các dữ liệu liên quan tùy theo loại bài tập
    public ICollection<Question> Questions { get; set; } = new List<Question>();
    public ICollection<Dialogue> Dialogues { get; set; } = new List<Dialogue>();
    public ICollection<ReadingPassage> ReadingPassages { get; set; } = new List<ReadingPassage>();
    public ICollection<SentencePattern> SentencePatterns { get; set; } = new List<SentencePattern>();
}

/// <summary>
/// Các loại bài tập có sẵn
/// </summary>
public static class ExerciseTypes
{
    public const string Vocabulary = "VOCABULARY"; // Từ vựng
    public const string QuickMemorize = "QUICK_MEMORIZE"; // Nhớ nhanh từ
    public const string TrueFalse = "TRUE_FALSE"; // Chọn đúng sai
    public const string TrueFalseSentence = "TRUE_FALSE_SENTENCE"; // Chọn đúng sai với câu
    public const string ListenChooseImage = "LISTEN_CHOOSE_IMAGE"; // Nghe câu chọn hình ảnh
    public const string MatchSentence = "MATCH_SENTENCE"; // Ghép câu
    public const string FillBlank = "FILL_BLANK"; // Điền từ
    public const string Flashcard = "FLASHCARD"; // Flashcard từ vựng
    public const string Dialogue = "DIALOGUE"; // Hội thoại
    public const string Reading = "READING"; // Đọc hiểu
    public const string Grammar = "GRAMMAR"; // Ngữ pháp
    public const string ArrangeSentence = "ARRANGE_SENTENCE"; // Sắp xếp câu
    public const string Translation = "TRANSLATION"; // Bài tập luyện dịch
    public const string ComprehensiveTest = "COMPREHENSIVE_TEST"; // Kiểm tra tổng hợp
}

