using HiHSK.Application.DTOs;

namespace HiHSK.Application.Interfaces;

public interface IQuizService
{
    Task<QuizResultDto> SubmitQuizAsync(QuizSubmissionDto submission, string userId);
    Task<List<QuestionDto>> GetLessonQuestionsAsync(int lessonId);
}







