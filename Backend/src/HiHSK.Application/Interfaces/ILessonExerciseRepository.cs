using HiHSK.Domain.Entities;

namespace HiHSK.Application.Interfaces;

public interface ILessonExerciseRepository
{
    Task<List<LessonExercise>> GetExercisesByTopicIdAsync(int topicId);
    Task<LessonExercise?> GetExerciseByIdAsync(int id);
    Task<LessonExercise?> GetExerciseWithDetailsAsync(int id);
    Task<bool> IsExerciseCompletedAsync(string userId, int exerciseId);
    Task<bool> IsPrerequisiteExerciseCompletedAsync(string userId, int? prerequisiteExerciseId);
}

