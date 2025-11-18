using HiHSK.Application.Interfaces;
using HiHSK.Domain.Entities;
using HiHSK.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HiHSK.Infrastructure.Repositories;

public class UserWordProgressRepository : IUserWordProgressRepository
{
    private readonly ApplicationDbContext _context;

    public UserWordProgressRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<UserWordProgress?> GetUserWordProgressAsync(string userId, int wordId)
    {
        return await _context.UserWordProgresses
            .FirstOrDefaultAsync(uwp => uwp.UserId == userId && uwp.WordId == wordId);
    }

    public async Task<List<UserWordProgress>> GetUserWordProgressesByTopicAsync(string userId, int topicId)
    {
        return await _context.UserWordProgresses
            .Include(uwp => uwp.Word)
                .ThenInclude(w => w.WordVocabularyTopics)
            .Where(uwp => uwp.UserId == userId && 
                         uwp.Word.WordVocabularyTopics.Any(wvt => wvt.VocabularyTopicId == topicId))
            .ToListAsync();
    }

    public async Task<List<UserWordProgress>> GetWordsDueForReviewAsync(string userId, int? topicId = null, int? limit = null)
    {
        var query = _context.UserWordProgresses
            .Include(uwp => uwp.Word)
            .Where(uwp => uwp.UserId == userId && 
                         uwp.NextReviewDate <= DateTime.UtcNow);

        if (topicId.HasValue)
        {
            query = query.Where(uwp => 
                uwp.Word.WordVocabularyTopics.Any(wvt => wvt.VocabularyTopicId == topicId.Value));
        }

        query = query.OrderBy(uwp => uwp.NextReviewDate);

        if (limit.HasValue)
        {
            query = query.Take(limit.Value);
        }

        return await query.ToListAsync();
    }

    public async Task<UserWordProgress> CreateOrUpdateProgressAsync(UserWordProgress progress)
    {
        var existing = await GetUserWordProgressAsync(progress.UserId, progress.WordId);
        
        if (existing != null)
        {
            existing.Status = progress.Status;
            existing.NextReviewDate = progress.NextReviewDate;
            existing.ReviewCount = progress.ReviewCount;
            existing.CorrectCount = progress.CorrectCount;
            existing.WrongCount = progress.WrongCount;
            existing.LastReviewedAt = progress.LastReviewedAt;
            _context.UserWordProgresses.Update(existing);
            await _context.SaveChangesAsync();
            return existing;
        }
        else
        {
            _context.UserWordProgresses.Add(progress);
            await _context.SaveChangesAsync();
            return progress;
        }
    }

    public async Task<int> GetNewWordsCountAsync(string userId, int? topicId = null)
    {
        var query = _context.UserWordProgresses
            .Where(uwp => uwp.UserId == userId && uwp.Status == "New");

        if (topicId.HasValue)
        {
            query = query.Where(uwp => 
                uwp.Word.WordVocabularyTopics.Any(wvt => wvt.VocabularyTopicId == topicId.Value));
        }

        return await query.CountAsync();
    }

    public async Task<int> GetLearningWordsCountAsync(string userId, int? topicId = null)
    {
        var query = _context.UserWordProgresses
            .Where(uwp => uwp.UserId == userId && uwp.Status == "Learning");

        if (topicId.HasValue)
        {
            query = query.Where(uwp => 
                uwp.Word.WordVocabularyTopics.Any(wvt => wvt.VocabularyTopicId == topicId.Value));
        }

        return await query.CountAsync();
    }

    public async Task<int> GetMasteredWordsCountAsync(string userId, int? topicId = null)
    {
        var query = _context.UserWordProgresses
            .Where(uwp => uwp.UserId == userId && uwp.Status == "Mastered");

        if (topicId.HasValue)
        {
            query = query.Where(uwp => 
                uwp.Word.WordVocabularyTopics.Any(wvt => wvt.VocabularyTopicId == topicId.Value));
        }

        return await query.CountAsync();
    }

    public async Task<int> GetWordsDueTodayCountAsync(string userId, int? topicId = null)
    {
        var query = _context.UserWordProgresses
            .Where(uwp => uwp.UserId == userId && uwp.NextReviewDate <= DateTime.UtcNow);

        if (topicId.HasValue)
        {
            query = query.Where(uwp => 
                uwp.Word.WordVocabularyTopics.Any(wvt => wvt.VocabularyTopicId == topicId.Value));
        }

        return await query.CountAsync();
    }

    public async Task<List<UserWordProgress>> GetUserWordProgressesByWordIdsAsync(string userId, List<int> wordIds)
    {
        if (wordIds == null || wordIds.Count == 0)
            return new List<UserWordProgress>();

        return await _context.UserWordProgresses
            .Where(uwp => uwp.UserId == userId && wordIds.Contains(uwp.WordId))
            .ToListAsync();
    }
}

