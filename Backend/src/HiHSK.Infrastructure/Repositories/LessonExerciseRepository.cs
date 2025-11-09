using HiHSK.Application.Interfaces;
using HiHSK.Domain.Entities;
using HiHSK.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HiHSK.Infrastructure.Repositories;

public class LessonExerciseRepository : ILessonExerciseRepository
{
    private readonly ApplicationDbContext _context;

    public LessonExerciseRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<LessonExercise>> GetExercisesByTopicIdAsync(int topicId)
    {
        return await _context.LessonExercises
            .Where(e => e.TopicId == topicId && e.IsActive)
            .OrderBy(e => e.ExerciseIndex)
            .ToListAsync();
    }

    public async Task<LessonExercise?> GetExerciseByIdAsync(int id)
    {
        return await _context.LessonExercises
            .Include(e => e.Topic)
            .FirstOrDefaultAsync(e => e.Id == id && e.IsActive);
    }

    public async Task<LessonExercise?> GetExerciseWithDetailsAsync(int id)
    {
        return await _context.LessonExercises
            .Include(e => e.Topic)
                .ThenInclude(t => t.Words.OrderBy(w => w.Character))
            .Include(e => e.Questions)
                .ThenInclude(q => q.QuestionOptions.OrderBy(o => o.OptionLabel))
            .Include(e => e.Dialogues)
                .ThenInclude(d => d.DialogueSentences.OrderBy(s => s.SentenceIndex))
            .Include(e => e.Dialogues)
                .ThenInclude(d => d.Questions)
                    .ThenInclude(q => q.QuestionOptions.OrderBy(o => o.OptionLabel))
            .Include(e => e.ReadingPassages)
                .ThenInclude(rp => rp.Questions)
                    .ThenInclude(q => q.QuestionOptions.OrderBy(o => o.OptionLabel))
            .Include(e => e.SentencePatterns)
                .ThenInclude(sp => sp.SentencePatternExamples.OrderBy(ex => ex.SortOrder))
            .FirstOrDefaultAsync(e => e.Id == id && e.IsActive);
    }

    public async Task<bool> IsExerciseCompletedAsync(string userId, int exerciseId)
    {
        // TODO: Implement logic kiểm tra exercise đã hoàn thành chưa
        // Có thể dựa vào UserAnswer hoặc UserProgress
        return false;
    }

    public async Task<bool> IsPrerequisiteExerciseCompletedAsync(string userId, int? prerequisiteExerciseId)
    {
        if (!prerequisiteExerciseId.HasValue)
            return true;

        return await IsExerciseCompletedAsync(userId, prerequisiteExerciseId.Value);
    }
}

