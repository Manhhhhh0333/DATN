using HiHSK.Application.DTOs;
using HiHSK.Domain.Entities;

namespace HiHSK.Application.Interfaces;

public interface IVocabularyRepository
{
    Task<List<VocabularyTopic>> GetAllTopicsAsync();
    Task<VocabularyTopic?> GetTopicByIdAsync(int topicId);
    Task<VocabularyTopic?> GetTopicWithWordsAsync(int topicId);
    Task<List<Word>> GetWordsByTopicIdAsync(int topicId);
    Task<int> GetWordCountByTopicIdAsync(int topicId);
    Task<List<Word>> GetWordsByHSKLevelAsync(int hskLevel);
    Task<Word?> GetWordByCharacterAsync(string character);
    Task<Word?> GetWordByIdAsync(int wordId);
    Task<Word> AddWordAsync(Word word);
    Task AddWordExamplesAsync(int wordId, List<WordExampleDto> examples);
    Task<List<int>> GetWordIdsByTopicIdAsync(int topicId);
}

