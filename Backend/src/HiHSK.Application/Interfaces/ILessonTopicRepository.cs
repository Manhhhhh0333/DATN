using HiHSK.Domain.Entities;

namespace HiHSK.Application.Interfaces;

public interface ILessonTopicRepository
{
    Task<List<LessonTopic>> GetTopicsByHSKLevelAsync(int hskLevel);
    Task<LessonTopic?> GetTopicByIdAsync(int id);
    Task<LessonTopic?> GetTopicWithExercisesAsync(int id);
    Task<LessonTopic?> GetTopicWithDetailsAsync(int id);
    Task<bool> IsTopicCompletedAsync(string userId, int topicId);
    Task<bool> IsPrerequisiteTopicCompletedAsync(string userId, int? prerequisiteTopicId);
}

