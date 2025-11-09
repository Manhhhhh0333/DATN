using HiHSK.Domain.Entities;

namespace HiHSK.Application.Interfaces;

public interface IUserProgressRepository
{
    Task<UserLessonStatus?> GetUserLessonStatusAsync(string userId, int lessonId);
    Task<UserLessonStatus> CreateOrUpdateUserLessonStatusAsync(string userId, int lessonId, string status, int progressPercentage);
    Task<UserLessonProgress> CreateUserLessonProgressAsync(UserLessonProgress progress);
    Task<UserCourseStatus?> GetUserCourseStatusAsync(string userId, int courseId);
    Task<UserCourseStatus> CreateOrUpdateUserCourseStatusAsync(string userId, int courseId, string status, int progressPercentage);
    Task<int> GetCompletedLessonsCountAsync(string userId, int courseId);
    Task<int> GetTotalLessonsCountAsync(int courseId);
}












