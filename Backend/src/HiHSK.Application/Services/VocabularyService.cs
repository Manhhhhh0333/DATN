using HiHSK.Application.DTOs;
using HiHSK.Application.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HiHSK.Application.Services;

public class VocabularyService : IVocabularyService
{
    private readonly IVocabularyRepository _vocabularyRepository;
    private readonly IUserWordProgressRepository _userProgressRepository;

    public VocabularyService(
        IVocabularyRepository vocabularyRepository,
        IUserWordProgressRepository userProgressRepository)
    {
        _vocabularyRepository = vocabularyRepository;
        _userProgressRepository = userProgressRepository;
    }

    public async Task<List<VocabularyTopicDto>> GetAllTopicsAsync(string? userId = null)
    {
        var topics = await _vocabularyRepository.GetAllTopicsAsync();
        var result = new List<VocabularyTopicDto>();

        foreach (var topic in topics)
        {
            var wordCount = await _vocabularyRepository.GetWordCountByTopicIdAsync(topic.Id);
            
            result.Add(new VocabularyTopicDto
            {
                Id = topic.Id,
                Name = topic.Name,
                Description = topic.Description,
                ImageUrl = topic.ImageUrl,
                SortOrder = topic.SortOrder,
                WordCount = wordCount
            });
        }

        return result;
    }

    public async Task<VocabularyTopicDetailDto?> GetTopicByIdAsync(int topicId, string? userId = null)
    {
        var topic = await _vocabularyRepository.GetTopicWithWordsAsync(topicId);
        if (topic == null)
            return null;

        var words = topic.WordVocabularyTopics.Select(wvt => wvt.Word).ToList();
        var wordsWithProgress = new List<WordWithProgressDto>();

        foreach (var word in words)
        {
            var wordDto = new WordWithProgressDto
            {
                Id = word.Id,
                Character = word.Character,
                Pinyin = word.Pinyin,
                Meaning = word.Meaning,
                AudioUrl = word.AudioUrl,
                ExampleSentence = word.ExampleSentence,
                HSKLevel = word.HSKLevel,
                StrokeCount = word.StrokeCount
            };

            if (userId != null)
            {
                var progress = await _userProgressRepository.GetUserWordProgressAsync(userId, word.Id);
                if (progress != null)
                {
                    wordDto.Progress = new UserWordProgressDto
                    {
                        Id = progress.Id,
                        Status = progress.Status,
                        NextReviewDate = progress.NextReviewDate,
                        ReviewCount = progress.ReviewCount,
                        CorrectCount = progress.CorrectCount,
                        WrongCount = progress.WrongCount,
                        LastReviewedAt = progress.LastReviewedAt
                    };
                }
            }

            wordsWithProgress.Add(wordDto);
        }

        return new VocabularyTopicDetailDto
        {
            Id = topic.Id,
            Name = topic.Name,
            Description = topic.Description,
            ImageUrl = topic.ImageUrl,
            SortOrder = topic.SortOrder,
            WordCount = words.Count,
            Words = wordsWithProgress
        };
    }

    public async Task<List<FlashcardReviewDto>> GetWordsForReviewAsync(int topicId, string userId, bool onlyDue = true, int? limit = null)
    {
        List<Domain.Entities.Word> words;

        if (onlyDue)
        {
            var progressList = await _userProgressRepository.GetWordsDueForReviewAsync(userId, topicId, limit);
            words = progressList.Select(p => p.Word).ToList();
        }
        else
        {
            words = await _vocabularyRepository.GetWordsByTopicIdAsync(topicId);
            if (limit.HasValue)
            {
                words = words.Take(limit.Value).ToList();
            }
        }

        var result = new List<FlashcardReviewDto>();

        foreach (var word in words)
        {
            var progress = await _userProgressRepository.GetUserWordProgressAsync(userId, word.Id);
            
            result.Add(new FlashcardReviewDto
            {
                WordId = word.Id,
                Character = word.Character,
                Pinyin = word.Pinyin,
                Meaning = word.Meaning,
                AudioUrl = word.AudioUrl,
                ExampleSentence = word.ExampleSentence,
                Progress = progress != null ? new UserWordProgressDto
                {
                    Id = progress.Id,
                    Status = progress.Status,
                    NextReviewDate = progress.NextReviewDate,
                    ReviewCount = progress.ReviewCount,
                    CorrectCount = progress.CorrectCount,
                    WrongCount = progress.WrongCount,
                    LastReviewedAt = progress.LastReviewedAt
                } : null
            });
        }

        return result;
    }

    public async Task<ReviewStatsDto> GetTopicStatsAsync(int topicId, string userId)
    {
        var totalWords = await _vocabularyRepository.GetWordCountByTopicIdAsync(topicId);
        var newWords = await _userProgressRepository.GetNewWordsCountAsync(userId, topicId);
        var learningWords = await _userProgressRepository.GetLearningWordsCountAsync(userId, topicId);
        var masteredWords = await _userProgressRepository.GetMasteredWordsCountAsync(userId, topicId);
        var wordsDueToday = await _userProgressRepository.GetWordsDueTodayCountAsync(userId, topicId);

        return new ReviewStatsDto
        {
            TotalWords = totalWords,
            NewWords = newWords,
            LearningWords = learningWords,
            MasteredWords = masteredWords,
            WordsDueToday = wordsDueToday
        };
    }

    public async Task<ReviewStatsDto> GetOverallStatsAsync(string userId)
    {
        var newWords = await _userProgressRepository.GetNewWordsCountAsync(userId);
        var learningWords = await _userProgressRepository.GetLearningWordsCountAsync(userId);
        var masteredWords = await _userProgressRepository.GetMasteredWordsCountAsync(userId);
        var wordsDueToday = await _userProgressRepository.GetWordsDueTodayCountAsync(userId);

        return new ReviewStatsDto
        {
            TotalWords = 0, // Tổng số từ sẽ được tính từ tất cả topics
            NewWords = newWords,
            LearningWords = learningWords,
            MasteredWords = masteredWords,
            WordsDueToday = wordsDueToday
        };
    }
}

