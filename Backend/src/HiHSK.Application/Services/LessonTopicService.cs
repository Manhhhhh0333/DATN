using HiHSK.Application.DTOs;
using HiHSK.Application.Interfaces;

namespace HiHSK.Application.Services;

public class LessonTopicService : ILessonTopicService
{
    private readonly ILessonTopicRepository _topicRepository;
    private readonly ILessonExerciseRepository _exerciseRepository;

    public LessonTopicService(
        ILessonTopicRepository topicRepository,
        ILessonExerciseRepository exerciseRepository)
    {
        _topicRepository = topicRepository;
        _exerciseRepository = exerciseRepository;
    }

    public async Task<List<LessonTopicListDto>> GetTopicsByHSKLevelAsync(int hskLevel, string userId)
    {
        var topics = await _topicRepository.GetTopicsByHSKLevelAsync(hskLevel);
        var result = new List<LessonTopicListDto>();

        foreach (var topic in topics)
        {
            var isLocked = await CheckTopicUnlockStatusAsync(topic.Id, userId);
            var isCompleted = await _topicRepository.IsTopicCompletedAsync(userId, topic.Id);

            // Đếm số exercises và words
            var topicWithDetails = await _topicRepository.GetTopicWithExercisesAsync(topic.Id);
            var totalExercises = topicWithDetails?.Exercises.Count ?? 0;
            var totalWords = topicWithDetails?.Words.Count ?? 0;

            // Tính progress (TODO: Implement logic tính progress thực tế)
            var progressPercentage = isCompleted ? 100 : 0;

            result.Add(new LessonTopicListDto
            {
                Id = topic.Id,
                HSKLevel = topic.HSKLevel,
                Title = topic.Title,
                Description = topic.Description,
                ImageUrl = topic.ImageUrl,
                TopicIndex = topic.TopicIndex,
                IsLocked = isLocked,
                TotalExercises = totalExercises,
                TotalWords = totalWords,
                ProgressPercentage = progressPercentage
            });
        }

        return result;
    }

    public async Task<LessonTopicDto?> GetTopicByIdAsync(int id, string userId)
    {
        var topic = await _topicRepository.GetTopicWithDetailsAsync(id);
        if (topic == null)
            return null;

        var isLocked = await CheckTopicUnlockStatusAsync(id, userId);
        var isCompleted = await _topicRepository.IsTopicCompletedAsync(userId, topic.Id);

        // Tính progress
        var totalExercises = topic.Exercises.Count;
        var completedExercises = 0; // TODO: Đếm exercises đã hoàn thành
        var progressPercentage = totalExercises > 0 
            ? (completedExercises * 100) / totalExercises 
            : 0;

        return new LessonTopicDto
        {
            Id = topic.Id,
            CourseId = topic.CourseId,
            HSKLevel = topic.HSKLevel,
            Title = topic.Title,
            Description = topic.Description,
            ImageUrl = topic.ImageUrl,
            TopicIndex = topic.TopicIndex,
            IsLocked = isLocked,
            PrerequisiteTopicId = topic.PrerequisiteTopicId,
            TotalExercises = totalExercises,
            TotalWords = topic.Words.Count,
            ProgressPercentage = progressPercentage
        };
    }

    public async Task<bool> CheckTopicUnlockStatusAsync(int topicId, string userId)
    {
        var topic = await _topicRepository.GetTopicByIdAsync(topicId);
        if (topic == null)
            return true;

        // Nếu topic không bị khóa trong database, cho phép truy cập
        if (!topic.IsLocked)
            return false;

        // Kiểm tra prerequisite
        if (topic.PrerequisiteTopicId.HasValue)
        {
            var prerequisiteCompleted = await _topicRepository.IsPrerequisiteTopicCompletedAsync(
                userId, topic.PrerequisiteTopicId.Value);

            return !prerequisiteCompleted; // Return true nếu bị khóa
        }

        // Topic đầu tiên trong HSK Level thì mở khóa
        if (topic.TopicIndex == 1)
            return false;

        return true; // Các topic khác mặc định bị khóa
    }
}

