using HiHSK.Application.Interfaces;
using HiHSK.Domain.Entities;
using HiHSK.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HiHSK.Infrastructure.Repositories;

public class WordClassificationRepository : IWordClassificationRepository
{
    private readonly ApplicationDbContext _context;

    public WordClassificationRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Word>> GetWordsByHSKLevelAsync(int hskLevel)
    {
        return await _context.Words
            .Where(w => w.HSKLevel == hskLevel)
            .OrderBy(w => w.Id)
            .ToListAsync();
    }

    public async Task<List<Word>> GetWordsWithoutTopicAsync(int hskLevel)
    {
        return await _context.Words
            .Where(w => w.HSKLevel == hskLevel && w.TopicId == null)
            .OrderBy(w => w.Id)
            .ToListAsync();
    }

    public async Task<List<Word>> GetWordsByIdsAsync(List<int> wordIds)
    {
        return await _context.Words
            .Where(w => wordIds.Contains(w.Id))
            .ToListAsync();
    }

    public async Task UpdateWordTopicIdAsync(int wordId, int? topicId)
    {
        var word = await _context.Words.FindAsync(wordId);
        if (word != null)
        {
            word.TopicId = topicId;
            await _context.SaveChangesAsync();
        }
    }

    public async Task UpdateWordsTopicIdAsync(List<int> wordIds, int topicId)
    {
        var words = await _context.Words
            .Where(w => wordIds.Contains(w.Id))
            .ToListAsync();

        foreach (var word in words)
        {
            word.TopicId = topicId;
        }

        await _context.SaveChangesAsync();
    }

    public async Task<List<LessonTopic>> GetLessonTopicsByHSKLevelAsync(int hskLevel)
    {
        return await _context.LessonTopics
            .Where(t => t.HSKLevel == hskLevel)
            .OrderBy(t => t.TopicIndex)
            .ToListAsync();
    }

    public async Task<LessonTopic?> GetLessonTopicByIdAsync(int topicId)
    {
        return await _context.LessonTopics.FindAsync(topicId);
    }

    public async Task<LessonTopic> CreateLessonTopicAsync(LessonTopic topic)
    {
        _context.LessonTopics.Add(topic);
        await _context.SaveChangesAsync();
        return topic;
    }

    public async Task<Course?> GetCourseByHSKLevelAsync(int hskLevel)
    {
        return await _context.Courses
            .FirstOrDefaultAsync(c => c.HSKLevel == hskLevel);
    }
}

