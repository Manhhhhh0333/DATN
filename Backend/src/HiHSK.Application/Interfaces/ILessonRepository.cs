using HiHSK.Domain.Entities;

namespace HiHSK.Application.Interfaces;

public interface ILessonRepository
{
    Task<List<Lesson>> GetLessonsByCourseIdAsync(int courseId);
    Task<Lesson?> GetLessonByIdAsync(int id);
    Task<Lesson?> GetLessonWithDetailsAsync(int id);
    Task<bool> IsLessonCompletedAsync(string userId, int lessonId);
    Task<bool> IsPrerequisiteLessonCompletedAsync(string userId, int? prerequisiteLessonId);
    Task<List<Lesson>> GetCompletedLessonsAsync(string userId, int courseId);
    Task<Lesson?> GetNextLessonAsync(int courseId, int currentLessonIndex);
    Task<List<Lesson>> GetLessonsByHSKLevelAsync(int hskLevel);
}







