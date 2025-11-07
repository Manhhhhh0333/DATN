namespace HiHSK.Domain.Entities;

public class Word
{
    public int Id { get; set; }
    public int? LessonId { get; set; }
    public int? TopicId { get; set; } // Chủ đề trong giáo trình HSK
    public string Character { get; set; } = string.Empty;
    public string Pinyin { get; set; } = string.Empty;
    public string Meaning { get; set; } = string.Empty;
    public string? AudioUrl { get; set; }
    public string? ExampleSentence { get; set; }
    public int? HSKLevel { get; set; }
    public int? Frequency { get; set; }
    public int? StrokeCount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Lesson? Lesson { get; set; }
    public LessonTopic? Topic { get; set; }
    public ICollection<UserWordProgress> UserWordProgresses { get; set; } = new List<UserWordProgress>();
    public ICollection<WordVocabularyTopic> WordVocabularyTopics { get; set; } = new List<WordVocabularyTopic>();
    public ICollection<WordRadical> WordRadicals { get; set; } = new List<WordRadical>();
    public ICollection<WordMeasureWord> WordMeasureWords { get; set; } = new List<WordMeasureWord>();
    public ICollection<FavoriteWord> FavoriteWords { get; set; } = new List<FavoriteWord>();
    public ICollection<UserPronunciationAttempt> UserPronunciationAttempts { get; set; } = new List<UserPronunciationAttempt>();
    public ICollection<ReadingPassageWord> ReadingPassageWords { get; set; } = new List<ReadingPassageWord>();
    public ICollection<UserReadingWordMark> UserReadingWordMarks { get; set; } = new List<UserReadingWordMark>();
    public ICollection<WritingExercise> WritingExercises { get; set; } = new List<WritingExercise>();
}

