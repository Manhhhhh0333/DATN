using HiHSK.Application.Interfaces;
using HiHSK.Domain.Entities;
using HiHSK.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HiHSK.Infrastructure.Repositories;

public class ActivityProgressRepository : IActivityProgressRepository
{
    private readonly ApplicationDbContext _context;

    public ActivityProgressRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<UserActivityProgress>> GetUserActivityProgressByPartAsync(
        string userId, 
        int hskLevel, 
        int partNumber)
    {
        return await _context.UserActivityProgresses
            .Where(p => p.UserId == userId 
                && p.HskLevel == hskLevel 
                && p.PartNumber == partNumber)
            .ToListAsync();
    }

    public async Task<List<UserActivityProgress>> GetUserActivityProgressByTopicAsync(
        string userId, 
        int topicId)
    {
        return await _context.UserActivityProgresses
            .Where(p => p.UserId == userId && p.TopicId == topicId)
            .ToListAsync();
    }

    public async Task<UserActivityProgress> MarkActivityCompletedAsync(
        string userId,
        int? hskLevel,
        int? partNumber,
        int? topicId,
        string activityId,
        int? score = null)
    {
        // Tìm xem đã có record chưa
        UserActivityProgress? existing = null;

        if (hskLevel.HasValue && partNumber.HasValue)
        {
            existing = await _context.UserActivityProgresses
                .FirstOrDefaultAsync(p => 
                    p.UserId == userId 
                    && p.HskLevel == hskLevel 
                    && p.PartNumber == partNumber 
                    && p.ActivityId == activityId);
        }
        else if (topicId.HasValue)
        {
            existing = await _context.UserActivityProgresses
                .FirstOrDefaultAsync(p => 
                    p.UserId == userId 
                    && p.TopicId == topicId 
                    && p.ActivityId == activityId);
        }

        if (existing != null)
        {
            // Update existing
            existing.IsCompleted = true;
            existing.Score = score;
            existing.CompletedAt = DateTime.UtcNow;
            existing.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return existing;
        }

        // Create new
        var newProgress = new UserActivityProgress
        {
            UserId = userId,
            HskLevel = hskLevel,
            PartNumber = partNumber,
            TopicId = topicId,
            ActivityId = activityId,
            IsCompleted = true,
            Score = score,
            CompletedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.UserActivityProgresses.Add(newProgress);
        await _context.SaveChangesAsync();
        return newProgress;
    }

    public async Task<bool> IsActivityCompletedAsync(
        string userId,
        int? hskLevel,
        int? partNumber,
        int? topicId,
        string activityId)
    {
        if (hskLevel.HasValue && partNumber.HasValue)
        {
            return await _context.UserActivityProgresses
                .AnyAsync(p => 
                    p.UserId == userId 
                    && p.HskLevel == hskLevel 
                    && p.PartNumber == partNumber 
                    && p.ActivityId == activityId 
                    && p.IsCompleted);
        }
        else if (topicId.HasValue)
        {
            return await _context.UserActivityProgresses
                .AnyAsync(p => 
                    p.UserId == userId 
                    && p.TopicId == topicId 
                    && p.ActivityId == activityId 
                    && p.IsCompleted);
        }

        return false;
    }

    public async Task<int> CountCompletedActivitiesAsync(
        string userId,
        int? hskLevel,
        int? partNumber,
        int? topicId)
    {
        if (hskLevel.HasValue && partNumber.HasValue)
        {
            return await _context.UserActivityProgresses
                .CountAsync(p => 
                    p.UserId == userId 
                    && p.HskLevel == hskLevel 
                    && p.PartNumber == partNumber 
                    && p.IsCompleted);
        }
        else if (topicId.HasValue)
        {
            return await _context.UserActivityProgresses
                .CountAsync(p => 
                    p.UserId == userId 
                    && p.TopicId == topicId 
                    && p.IsCompleted);
        }

        return 0;
    }

    public async Task<UserActivityProgress?> GetActivityProgressByIdAsync(int id)
    {
        return await _context.UserActivityProgresses.FindAsync(id);
    }

    public async Task<bool> CheckAndMarkVocabularyCompletedAsync(
        string userId,
        int hskLevel,
        int partNumber,
        List<int> wordIds)
    {
        if (wordIds == null || wordIds.Count == 0)
            return false;

        // Lấy progress của tất cả từ trong part
        var wordProgresses = await _context.UserWordProgresses
            .Where(p => p.UserId == userId && wordIds.Contains(p.WordId))
            .ToListAsync();

        // Kiểm tra xem tất cả từ đã được đánh dấu là "đã học" (Learning hoặc Mastered) chưa
        var allWordsLearned = wordIds.Count > 0 && 
            wordProgresses.Count == wordIds.Count && // Tất cả từ đều có progress
            wordProgresses.All(p => p.Status == "Learning" || p.Status == "Mastered");

        if (allWordsLearned)
        {
            // Tự động đánh dấu activity "vocabulary" là completed
            await MarkActivityCompletedAsync(
                userId,
                hskLevel,
                partNumber,
                null,
                "vocabulary",
                null);
            
            return true;
        }

        return false;
    }

    public async Task<bool> CheckAndMarkVocabularyCompletedByTopicAsync(
        string userId,
        int topicId,
        List<int> wordIds)
    {
        if (wordIds == null || wordIds.Count == 0)
            return false;

        // Lấy progress của tất cả từ trong topic
        var wordProgresses = await _context.UserWordProgresses
            .Where(p => p.UserId == userId && wordIds.Contains(p.WordId))
            .ToListAsync();

        // Kiểm tra xem tất cả từ đã được đánh dấu là "đã học" (Learning hoặc Mastered) chưa
        var allWordsLearned = wordIds.Count > 0 && 
            wordProgresses.Count == wordIds.Count && // Tất cả từ đều có progress
            wordProgresses.All(p => p.Status == "Learning" || p.Status == "Mastered");

        if (allWordsLearned)
        {
            // Tự động đánh dấu activity "vocabulary" là completed cho topic
            await MarkActivityCompletedAsync(
                userId,
                null,
                null,
                topicId,
                "vocabulary",
                null);
            
            return true;
        }

        return false;
    }
}

