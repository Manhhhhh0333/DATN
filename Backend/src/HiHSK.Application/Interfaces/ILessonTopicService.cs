using HiHSK.Application.DTOs;

namespace HiHSK.Application.Interfaces;

public interface ILessonTopicService
{
    Task<List<LessonTopicListDto>> GetTopicsByHSKLevelAsync(int hskLevel, string userId);
    Task<LessonTopicDto?> GetTopicByIdAsync(int id, string userId);
    Task<bool> CheckTopicUnlockStatusAsync(int topicId, string userId);
}

