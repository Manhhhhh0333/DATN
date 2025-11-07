using HiHSK.Application.DTOs;
using HiHSK.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HiHSK.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class QuizController : ControllerBase
{
    private readonly IQuizService _quizService;

    public QuizController(IQuizService quizService)
    {
        _quizService = quizService;
    }

    /// <summary>
    /// Lấy danh sách câu hỏi của bài học (không có đáp án)
    /// </summary>
    /// <param name="lessonId">ID bài học</param>
    [HttpGet("lesson/{lessonId}")]
    public async Task<ActionResult<List<QuestionDto>>> GetLessonQuestions(int lessonId)
    {
        var questions = await _quizService.GetLessonQuestionsAsync(lessonId);
        return Ok(questions);
    }

    /// <summary>
    /// Nộp bài quiz và nhận kết quả
    /// </summary>
    /// <param name="submission">Dữ liệu nộp bài</param>
    [HttpPost("submit")]
    public async Task<ActionResult<QuizResultDto>> SubmitQuiz([FromBody] QuizSubmissionDto submission)
    {
        if (submission == null || submission.Answers == null || !submission.Answers.Any())
        {
            return BadRequest(new { message = "Dữ liệu nộp bài không hợp lệ" });
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        try
        {
            var result = await _quizService.SubmitQuizAsync(submission, userId!);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi xử lý bài quiz", error = ex.Message });
        }
    }
}





