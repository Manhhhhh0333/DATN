using HiHSK.Domain.Entities;

namespace HiHSK.Application.Interfaces;

public interface IVocabularyRepository
{
    Task<List<VocabularyTopic>> GetAllTopicsAsync();
    Task<VocabularyTopic?> GetTopicByIdAsync(int topicId);
    Task<VocabularyTopic?> GetTopicWithWordsAsync(int topicId);
    Task<List<Word>> GetWordsByTopicIdAsync(int topicId);
    Task<int> GetWordCountByTopicIdAsync(int topicId);
}

