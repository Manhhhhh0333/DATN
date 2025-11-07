using HiHSK.Application.Interfaces;
using HiHSK.Domain.Entities;
using HiHSK.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HiHSK.Infrastructure.Repositories;

public class VocabularyRepository : IVocabularyRepository
{
    private readonly ApplicationDbContext _context;

    public VocabularyRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<VocabularyTopic>> GetAllTopicsAsync()
    {
        return await _context.VocabularyTopics
            .OrderBy(t => t.SortOrder)
            .ThenBy(t => t.Name)
            .ToListAsync();
    }

    public async Task<VocabularyTopic?> GetTopicByIdAsync(int topicId)
    {
        return await _context.VocabularyTopics
            .FirstOrDefaultAsync(t => t.Id == topicId);
    }

    public async Task<VocabularyTopic?> GetTopicWithWordsAsync(int topicId)
    {
        return await _context.VocabularyTopics
            .Include(t => t.WordVocabularyTopics)
                .ThenInclude(wvt => wvt.Word)
            .FirstOrDefaultAsync(t => t.Id == topicId);
    }

    public async Task<List<Word>> GetWordsByTopicIdAsync(int topicId)
    {
        return await _context.WordVocabularyTopics
            .Where(wvt => wvt.VocabularyTopicId == topicId)
            .Include(wvt => wvt.Word)
            .Select(wvt => wvt.Word)
            .OrderBy(w => w.Character)
            .ToListAsync();
    }

    public async Task<int> GetWordCountByTopicIdAsync(int topicId)
    {
        return await _context.WordVocabularyTopics
            .CountAsync(wvt => wvt.VocabularyTopicId == topicId);
    }
}

