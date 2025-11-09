using HiHSK.Application.DTOs;

namespace HiHSK.Application.Interfaces;

public interface ILessonExerciseService
{
    Task<List<LessonExerciseListDto>> GetExercisesByTopicIdAsync(int topicId, string userId);
    Task<LessonExerciseDto?> GetExerciseByIdAsync(int id, string userId);
    Task<bool> CheckExerciseUnlockStatusAsync(int exerciseId, string userId);
}

