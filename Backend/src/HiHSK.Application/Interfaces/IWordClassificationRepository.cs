using HiHSK.Domain.Entities;

namespace HiHSK.Application.Interfaces;

/// <summary>
/// Repository để truy cập dữ liệu cho Word Classification
/// </summary>
public interface IWordClassificationRepository
{
    // Words
    Task<List<Word>> GetWordsByHSKLevelAsync(int hskLevel);
    Task<List<Word>> GetWordsWithoutTopicAsync(int hskLevel);
    Task<List<Word>> GetWordsByIdsAsync(List<int> wordIds);
    Task UpdateWordTopicIdAsync(int wordId, int? topicId);
    Task UpdateWordsTopicIdAsync(List<int> wordIds, int topicId);

    // LessonTopics
    Task<List<LessonTopic>> GetLessonTopicsByHSKLevelAsync(int hskLevel);
    Task<LessonTopic?> GetLessonTopicByIdAsync(int topicId);
    Task<LessonTopic> CreateLessonTopicAsync(LessonTopic topic);
    Task<Course?> GetCourseByHSKLevelAsync(int hskLevel);
}

