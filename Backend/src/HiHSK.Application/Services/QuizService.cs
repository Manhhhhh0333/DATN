using HiHSK.Application.DTOs;
using HiHSK.Application.Interfaces;
using HiHSK.Domain.Entities;

namespace HiHSK.Application.Services;

public class QuizService : IQuizService
{
    private readonly IQuestionRepository _questionRepository;
    private readonly ILessonRepository _lessonRepository;
    private readonly IUserProgressRepository _userProgressRepository;

    public QuizService(
        IQuestionRepository questionRepository,
        ILessonRepository lessonRepository,
        IUserProgressRepository userProgressRepository)
    {
        _questionRepository = questionRepository;
        _lessonRepository = lessonRepository;
        _userProgressRepository = userProgressRepository;
    }

    public async Task<List<QuestionDto>> GetLessonQuestionsAsync(int lessonId)
    {
        var questions = await _questionRepository.GetQuestionsWithOptionsByLessonIdAsync(lessonId);

        return questions.Select(q => new QuestionDto
        {
            Id = q.Id,
            QuestionText = q.QuestionText,
            QuestionType = q.QuestionType,
            AudioUrl = q.AudioUrl,
            Points = q.Points,
            Explanation = q.Explanation,
            Options = q.QuestionOptions.Select(o => new QuestionOptionDto
            {
                Id = o.Id,
                OptionText = o.OptionText,
                OptionLabel = o.OptionLabel,
                IsCorrect = false // Ẩn đáp án đúng khi gửi câu hỏi cho user
            }).ToList()
        }).ToList();
    }

    public async Task<QuizResultDto> SubmitQuizAsync(QuizSubmissionDto submission, string userId)
    {
        var lesson = await _lessonRepository.GetLessonWithDetailsAsync(submission.LessonId);
        if (lesson == null)
            throw new ArgumentException("Lesson not found");

        var totalPoints = 0;
        var score = 0;
        var correctAnswers = 0;
        var wrongAnswers = 0;
        var questionResults = new List<QuestionResultDto>();

        // Load lại questions từ database để có đáp án đúng
        var questionsWithAnswers = await _questionRepository.GetQuestionsWithOptionsByLessonIdAsync(submission.LessonId);

        // Chấm từng câu hỏi
        foreach (var answer in submission.Answers)
        {
            var question = questionsWithAnswers.FirstOrDefault(q => q.Id == answer.QuestionId);
            if (question == null)
                continue;

            totalPoints += question.Points;

            var isCorrect = false;
            var pointsEarned = 0;

            if (question.QuestionType == "CHOOSE_MEANING" || question.QuestionType == "READING" || question.QuestionType == "LISTENING")
            {
                // Câu hỏi trắc nghiệm
                if (answer.SelectedOptionId.HasValue)
                {
                    var selectedOption = question.QuestionOptions.FirstOrDefault(o => o.Id == answer.SelectedOptionId.Value);
                    if (selectedOption != null && selectedOption.IsCorrect)
                    {
                        isCorrect = true;
                        pointsEarned = question.Points;
                        score += question.Points;
                        correctAnswers++;
                    }
                    else
                    {
                        wrongAnswers++;
                    }
                }
                else
                {
                    wrongAnswers++;
                }
            }
            else if (question.QuestionType == "FILL_BLANK" || question.QuestionType == "WRITING")
            {
                // Câu hỏi tự luận - cần xử lý logic so sánh câu trả lời
                // Ở đây đơn giản hóa, có thể mở rộng thêm logic kiểm tra câu trả lời
                // TODO: Implement text matching logic
                wrongAnswers++;
            }

            questionResults.Add(new QuestionResultDto
            {
                QuestionId = question.Id,
                IsCorrect = isCorrect,
                PointsEarned = pointsEarned,
                SelectedOptionId = answer.SelectedOptionId,
                Explanation = isCorrect ? null : question.Explanation
            });
        }

        // Lưu kết quả vào database
        var userProgress = new UserLessonProgress
        {
            UserId = userId,
            LessonId = submission.LessonId,
            Score = score,
            TotalQuestions = submission.Answers.Count,
            TotalPoints = totalPoints,
            CorrectAnswers = correctAnswers,
            WrongAnswers = wrongAnswers,
            CompletedAt = DateTime.UtcNow
        };

        await _userProgressRepository.CreateUserLessonProgressAsync(userProgress);

        // Cập nhật trạng thái bài học
        var lessonCompleted = score >= totalPoints * 0.7; // 70% để pass
        if (lessonCompleted)
        {
            await _userProgressRepository.CreateOrUpdateUserLessonStatusAsync(
                userId, submission.LessonId, "Completed", 100);
        }
        else
        {
            var progressPercentage = (int)Math.Round((double)score / totalPoints * 100);
            await _userProgressRepository.CreateOrUpdateUserLessonStatusAsync(
                userId, submission.LessonId, "InProgress", progressPercentage);
        }

        // Kiểm tra và mở khóa bài học tiếp theo
        var nextLesson = await _lessonRepository.GetNextLessonAsync(lesson.CourseId, lesson.LessonIndex);
        var nextLessonUnlocked = false;
        int? nextLessonId = null;

        if (lessonCompleted && nextLesson != null)
        {
            // Bài học tiếp theo sẽ được mở khóa tự động khi bài hiện tại hoàn thành
            // Logic unlock được xử lý trong CheckLessonUnlockStatusAsync
            nextLessonUnlocked = true;
            nextLessonId = nextLesson.Id;
        }

        // Cập nhật tiến độ khóa học
        var courseProgress = await CalculateCourseProgress(lesson.CourseId, userId);
        await _userProgressRepository.CreateOrUpdateUserCourseStatusAsync(
            userId, lesson.CourseId, 
            courseProgress == 100 ? "Completed" : "InProgress", 
            courseProgress);

        return new QuizResultDto
        {
            Score = score,
            TotalPoints = totalPoints,
            TotalQuestions = submission.Answers.Count,
            CorrectAnswers = correctAnswers,
            WrongAnswers = wrongAnswers,
            LessonCompleted = lessonCompleted,
            NextLessonUnlocked = nextLessonUnlocked,
            NextLessonId = nextLessonId,
            QuestionResults = questionResults
        };
    }

    private async Task<int> CalculateCourseProgress(int courseId, string userId)
    {
        var totalLessons = await _userProgressRepository.GetTotalLessonsCountAsync(courseId);
        if (totalLessons == 0)
            return 0;

        var completedLessons = await _userProgressRepository.GetCompletedLessonsCountAsync(userId, courseId);
        return (int)Math.Round((double)completedLessons / totalLessons * 100);
    }
}

