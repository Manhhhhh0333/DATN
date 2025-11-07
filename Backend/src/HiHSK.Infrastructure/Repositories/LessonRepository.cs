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
        return await _context.Lessons
            .Include(l => l.Course)
            .Include(l => l.Words.OrderBy(w => w.Character))
            .Include(l => l.SentencePatterns.OrderBy(sp => sp.Id))
            .Include(l => l.ReadingPassages.OrderBy(rp => rp.Id))
                .ThenInclude(rp => rp.Questions)
                    .ThenInclude(q => q.QuestionOptions.OrderBy(o => o.OptionLabel))
            .Include(l => l.Dialogues.OrderBy(d => d.Id))
                .ThenInclude(d => d.Questions)
                    .ThenInclude(q => q.QuestionOptions.OrderBy(o => o.OptionLabel))
            .Include(l => l.Questions)
                .ThenInclude(q => q.QuestionOptions.OrderBy(o => o.OptionLabel))
            .FirstOrDefaultAsync(l => l.Id == id && l.IsActive);
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
}





