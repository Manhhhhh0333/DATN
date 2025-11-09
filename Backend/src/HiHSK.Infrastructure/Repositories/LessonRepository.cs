using HiHSK.Application.Interfaces;
using HiHSK.Domain.Entities;
using HiHSK.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HiHSK.Infrastructure.Repositories;

public class LessonRepository : ILessonRepository
{
    private readonly ApplicationDbContext _context;

    public LessonRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Lesson>> GetLessonsByCourseIdAsync(int courseId)
    {
        return await _context.Lessons
            .Where(l => l.CourseId == courseId && l.IsActive)
            .OrderBy(l => l.LessonIndex)
            .ToListAsync();
    }

    public async Task<Lesson?> GetLessonByIdAsync(int id)
    {
        return await _context.Lessons
            .Include(l => l.Course)
            .FirstOrDefaultAsync(l => l.Id == id && l.IsActive);
    }

    public async Task<Lesson?> GetLessonWithDetailsAsync(int id)
    {
        try
        {
            // Load lesson cơ bản trước
            var lesson = await _context.Lessons
                .Include(l => l.Course)
                .FirstOrDefaultAsync(l => l.Id == id && l.IsActive);
            
            if (lesson == null) return null;

            // Load Words riêng, sử dụng FromSqlRaw để tránh select TopicId
            try
            {
                // Sử dụng raw SQL để chỉ select các column cần thiết (không có TopicId)
                var words = await _context.Words
                    .FromSqlRaw(
                        @"SELECT Id, Character, Pinyin, Meaning, AudioUrl, ExampleSentence, 
                                 HSKLevel, StrokeCount, Frequency, CreatedAt, LessonId
                          FROM Words 
                          WHERE LessonId = {0}",
                        id
                    )
                    .AsNoTracking()
                    .OrderBy(w => w.Character)
                    .ToListAsync();
                
                lesson.Words = words;
            }
            catch
            {
                // Nếu có lỗi (có thể do column không tồn tại), bỏ qua Words
                lesson.Words = new List<Word>();
            }

            // Load SentencePatterns riêng, sử dụng FromSqlRaw để tránh select ExerciseId
            try
            {
                // Sử dụng raw SQL để chỉ select các column cần thiết (không có ExerciseId)
                var sentencePatterns = await _context.SentencePatterns
                    .FromSqlRaw(
                        @"SELECT Id, LessonId, PatternText, Pinyin, Meaning, Usage, 
                                 ExampleSentences, Category, DifficultyLevel, CreatedAt
                          FROM SentencePatterns 
                          WHERE LessonId = {0}",
                        id
                    )
                    .AsNoTracking()
                    .OrderBy(sp => sp.Id)
                    .ToListAsync();
                
                lesson.SentencePatterns = sentencePatterns;
            }
            catch
            {
                // Nếu có lỗi (có thể do column không tồn tại), bỏ qua SentencePatterns
                lesson.SentencePatterns = new List<SentencePattern>();
            }

            // Load ReadingPassages, Dialogues, Questions với cách tương tự nếu cần
            // Tạm thời chỉ load cơ bản để tránh lỗi
            
            return lesson;
        }
        catch (Exception ex)
        {
            // Fallback: Load chỉ các thông tin cơ bản
            return await _context.Lessons
                .Include(l => l.Course)
                .FirstOrDefaultAsync(l => l.Id == id && l.IsActive);
        }
    }

    public async Task<bool> IsLessonCompletedAsync(string userId, int lessonId)
    {
        return await _context.UserLessonStatuses
            .AnyAsync(uls => uls.UserId == userId 
                && uls.LessonId == lessonId 
                && uls.Status == "Completed");
    }

    public async Task<bool> IsPrerequisiteLessonCompletedAsync(string userId, int? prerequisiteLessonId)
    {
        if (!prerequisiteLessonId.HasValue)
            return true; // Không có prerequisite

        return await IsLessonCompletedAsync(userId, prerequisiteLessonId.Value);
    }

    public async Task<List<Lesson>> GetCompletedLessonsAsync(string userId, int courseId)
    {
        var completedLessonIds = await _context.UserLessonStatuses
            .Where(uls => uls.UserId == userId 
                && uls.Status == "Completed"
                && uls.Lesson!.CourseId == courseId)
            .Select(uls => uls.LessonId)
            .ToListAsync();

        return await _context.Lessons
            .Where(l => completedLessonIds.Contains(l.Id))
            .ToListAsync();
    }

    public async Task<Lesson?> GetNextLessonAsync(int courseId, int currentLessonIndex)
    {
        return await _context.Lessons
            .Where(l => l.CourseId == courseId 
                && l.LessonIndex > currentLessonIndex 
                && l.IsActive)
            .OrderBy(l => l.LessonIndex)
            .FirstOrDefaultAsync();
    }

    public async Task<List<Lesson>> GetLessonsByHSKLevelAsync(int hskLevel)
    {
        return await _context.Lessons
            .Include(l => l.Course)
            .Where(l => l.Course.HSKLevel == hskLevel && l.IsActive)
            .OrderBy(l => l.LessonIndex)
            .ToListAsync();
    }

    public async Task<int> CountWordsByLessonIdAsync(int lessonId)
    {
        return await _context.Words
            .CountAsync(w => w.LessonId == lessonId);
    }

    public async Task<int> CountQuestionsByLessonIdAsync(int lessonId)
    {
        return await _context.Questions
            .CountAsync(q => q.LessonId == lessonId && 
                q.ReadingPassageId == null && 
                q.DialogueId == null && 
                q.SentencePatternId == null);
    }
}





