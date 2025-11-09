using HiHSK.Application.Interfaces;
using HiHSK.Domain.Entities;
using HiHSK.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HiHSK.Infrastructure.Repositories;

public class LessonTopicRepository : ILessonTopicRepository
{
    private readonly ApplicationDbContext _context;

    public LessonTopicRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<LessonTopic>> GetTopicsByHSKLevelAsync(int hskLevel)
    {
        return await _context.LessonTopics
            .Where(t => t.HSKLevel == hskLevel && t.IsActive)
            .OrderBy(t => t.TopicIndex)
            .ToListAsync();
    }

    public async Task<LessonTopic?> GetTopicByIdAsync(int id)
    {
        return await _context.LessonTopics
            .FirstOrDefaultAsync(t => t.Id == id && t.IsActive);
    }

    public async Task<LessonTopic?> GetTopicWithExercisesAsync(int id)
    {
        var topic = await _context.LessonTopics
            .Include(t => t.Exercises.Where(e => e.IsActive).OrderBy(e => e.ExerciseIndex))
            .FirstOrDefaultAsync(t => t.Id == id && t.IsActive);
        
        if (topic != null)
        {
            // Load Words riêng để tránh lỗi nếu cột TopicId chưa tồn tại
            // Kiểm tra xem cột TopicId có tồn tại không trước khi query
            try
            {
                var hasTopicIdColumn = await _context.Database
                    .ExecuteSqlRawAsync("SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Words' AND COLUMN_NAME = 'TopicId'") > 0;
                
                if (hasTopicIdColumn)
                {
                    // Cột TopicId đã tồn tại, query bình thường
                    var words = await _context.Words
                        .FromSqlRaw(@"
                            SELECT Id, Character, Pinyin, Meaning, HSKLevel, LessonId, 
                                   AudioUrl, ExampleSentence, Frequency, StrokeCount, CreatedAt,
                                   TopicId
                            FROM Words 
                            WHERE TopicId = {0}
                            ORDER BY Character", id)
                        .AsNoTracking()
                        .ToListAsync();
                    
                    foreach (var word in words)
                    {
                        topic.Words.Add(word);
                    }
                }
                // Nếu cột TopicId chưa tồn tại, không load Words (để trống)
            }
            catch
            {
                // Nếu có lỗi, bỏ qua load Words
                topic.Words = new List<Word>();
            }
        }
        
        return topic;
    }

    public async Task<LessonTopic?> GetTopicWithDetailsAsync(int id)
    {
        var topic = await _context.LessonTopics
            .Include(t => t.Exercises.Where(e => e.IsActive).OrderBy(e => e.ExerciseIndex))
                .ThenInclude(e => e.Questions)
                    .ThenInclude(q => q.QuestionOptions.OrderBy(o => o.OptionLabel))
            .Include(t => t.Exercises)
                .ThenInclude(e => e.Dialogues)
            .Include(t => t.Exercises)
                .ThenInclude(e => e.ReadingPassages)
            .Include(t => t.Exercises)
                .ThenInclude(e => e.SentencePatterns)
            .FirstOrDefaultAsync(t => t.Id == id && t.IsActive);
        
        if (topic != null)
        {
            // Load Words riêng để tránh lỗi nếu cột TopicId chưa tồn tại
            // Kiểm tra xem cột TopicId có tồn tại không trước khi query
            try
            {
                var hasTopicIdColumn = await _context.Database
                    .ExecuteSqlRawAsync("SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Words' AND COLUMN_NAME = 'TopicId'") > 0;
                
                if (hasTopicIdColumn)
                {
                    // Cột TopicId đã tồn tại, query bình thường
                    var words = await _context.Words
                        .FromSqlRaw(@"
                            SELECT Id, Character, Pinyin, Meaning, HSKLevel, LessonId, 
                                   AudioUrl, ExampleSentence, Frequency, StrokeCount, CreatedAt,
                                   TopicId
                            FROM Words 
                            WHERE TopicId = {0}
                            ORDER BY Character", id)
                        .AsNoTracking()
                        .ToListAsync();
                    
                    foreach (var word in words)
                    {
                        topic.Words.Add(word);
                    }
                }
                // Nếu cột TopicId chưa tồn tại, không load Words (để trống)
            }
            catch
            {
                // Nếu có lỗi, bỏ qua load Words
                topic.Words = new List<Word>();
            }
        }
        
        return topic;
    }

    public async Task<bool> IsTopicCompletedAsync(string userId, int topicId)
    {
        // TODO: Implement logic kiểm tra topic đã hoàn thành chưa
        // Có thể dựa vào việc tất cả exercises đã hoàn thành
        return false;
    }

    public async Task<bool> IsPrerequisiteTopicCompletedAsync(string userId, int? prerequisiteTopicId)
    {
        if (!prerequisiteTopicId.HasValue)
            return true;

        return await IsTopicCompletedAsync(userId, prerequisiteTopicId.Value);
    }
}

