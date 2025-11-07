using HiHSK.Domain.Entities;

namespace HiHSK.Application.Interfaces;

public interface IUserWordProgressRepository
{
    Task<UserWordProgress?> GetUserWordProgressAsync(string userId, int wordId);
    Task<List<UserWordProgress>> GetUserWordProgressesByTopicAsync(string userId, int topicId);
    Task<List<UserWordProgress>> GetWordsDueForReviewAsync(string userId, int? topicId = null, int? limit = null);
    Task<UserWordProgress> CreateOrUpdateProgressAsync(UserWordProgress progress);
    Task<int> GetNewWordsCountAsync(string userId, int? topicId = null);
    Task<int> GetLearningWordsCountAsync(string userId, int? topicId = null);
    Task<int> GetMasteredWordsCountAsync(string userId, int? topicId = null);
    Task<int> GetWordsDueTodayCountAsync(string userId, int? topicId = null);
}

