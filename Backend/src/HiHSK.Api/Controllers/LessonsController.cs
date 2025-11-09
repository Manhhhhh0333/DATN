using HiHSK.Application.DTOs;
using HiHSK.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HiHSK.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LessonsController : ControllerBase
{
    private readonly ILessonService _lessonService;

    public LessonsController(ILessonService lessonService)
    {
        _lessonService = lessonService;
    }

    /// <summary>
    /// Lấy danh sách bài học của một khóa học
    /// </summary>
    /// <param name="courseId">ID khóa học</param>
    [HttpGet("course/{courseId}")]
    public async Task<ActionResult<List<LessonListDto>>> GetLessonsByCourse(int courseId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var lessons = await _lessonService.GetLessonsByCourseIdAsync(courseId, userId!);
        return Ok(lessons);
    }

    /// <summary>
    /// Lấy danh sách bài học theo cấp độ HSK (không cần qua Course)
    /// </summary>
    /// <param name="hskLevel">Cấp độ HSK (1-6)</param>
    [HttpGet("hsk/{hskLevel}")]
    public async Task<ActionResult<List<LessonListDto>>> GetLessonsByHSKLevel(int hskLevel)
    {
        if (hskLevel < 1 || hskLevel > 6)
        {
            return BadRequest(new { message = "HSK Level phải từ 1 đến 6" });
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var lessons = await _lessonService.GetLessonsByHSKLevelAsync(hskLevel, userId!);
        return Ok(lessons);
    }

    /// <summary>
    /// Lấy thông tin chi tiết bài học
    /// </summary>
    /// <param name="id">ID bài học</param>
    [HttpGet("{id}")]
    public async Task<ActionResult<LessonDto>> GetLesson(int id)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var lesson = await _lessonService.GetLessonByIdAsync(id, userId);
            
            if (lesson == null)
                return NotFound(new { message = "Bài học không tồn tại" });

            if (lesson.IsLocked)
                return Forbid("Bạn chưa hoàn thành bài học trước đó");

            return Ok(lesson);
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi lấy thông tin bài học", error = ex.Message });
        }
    }

    /// <summary>
    /// Kiểm tra trạng thái mở khóa của bài học
    /// </summary>
    /// <param name="id">ID bài học</param>
    [HttpGet("{id}/unlock-status")]
    public async Task<ActionResult> GetUnlockStatus(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isLocked = await _lessonService.CheckLessonUnlockStatusAsync(id, userId!);
        
        return Ok(new { lessonId = id, isLocked });
    }
}







