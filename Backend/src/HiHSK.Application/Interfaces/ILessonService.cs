using HiHSK.Application.DTOs;

namespace HiHSK.Application.Interfaces;

public interface ILessonService
{
    Task<List<LessonListDto>> GetLessonsByCourseIdAsync(int courseId, string userId);
    Task<List<LessonListDto>> GetLessonsByHSKLevelAsync(int hskLevel, string userId);
    Task<LessonDto?> GetLessonByIdAsync(int id, string userId);
    Task<bool> CheckLessonUnlockStatusAsync(int lessonId, string userId);
}







