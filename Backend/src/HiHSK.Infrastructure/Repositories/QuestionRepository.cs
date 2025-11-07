using HiHSK.Application.Interfaces;
using HiHSK.Domain.Entities;
using HiHSK.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HiHSK.Infrastructure.Repositories;

public class QuestionRepository : IQuestionRepository
{
    private readonly ApplicationDbContext _context;

    public QuestionRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Question>> GetQuestionsByLessonIdAsync(int lessonId)
    {
        return await _context.Questions
            .Where(q => q.LessonId == lessonId)
            .OrderBy(q => q.Id)
            .ToListAsync();
    }

    public async Task<List<Question>> GetQuestionsWithOptionsByLessonIdAsync(int lessonId)
    {
        return await _context.Questions
            .Where(q => q.LessonId == lessonId)
            .Include(q => q.QuestionOptions.OrderBy(o => o.OptionLabel))
            .OrderBy(q => q.Id)
            .ToListAsync();
    }
}

