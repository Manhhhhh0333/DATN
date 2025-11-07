using HiHSK.Domain.Entities;

namespace HiHSK.Application.Interfaces;

public interface IQuestionRepository
{
    Task<List<Question>> GetQuestionsByLessonIdAsync(int lessonId);
    Task<List<Question>> GetQuestionsWithOptionsByLessonIdAsync(int lessonId);
}

