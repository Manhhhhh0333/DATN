using HiHSK.Application.DTOs;

namespace HiHSK.Application.Interfaces;

public interface ISRSService
{
    Task<UserWordProgressDto> UpdateReviewStatusAsync(string userId, int wordId, string rating);
    Task<List<FlashcardReviewDto>> GetWordsDueForReviewAsync(string userId, int? topicId = null, int? limit = null);
    Task<ReviewStatsDto> GetReviewStatsAsync(string userId, int? topicId = null);
}

