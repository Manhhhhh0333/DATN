using HiHSK.Application.DTOs;
using HiHSK.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HiHSK.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LessonExercisesController : ControllerBase
{
    private readonly ILessonExerciseService _exerciseService;

    public LessonExercisesController(ILessonExerciseService exerciseService)
    {
        _exerciseService = exerciseService;
    }

    /// <summary>
    /// Lấy danh sách bài tập theo chủ đề
    /// </summary>
    /// <param name="topicId">ID chủ đề</param>
    [HttpGet("topic/{topicId}")]
    public async Task<ActionResult<List<LessonExerciseListDto>>> GetExercisesByTopic(int topicId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var exercises = await _exerciseService.GetExercisesByTopicIdAsync(topicId, userId!);
        return Ok(exercises);
    }

    /// <summary>
    /// Lấy thông tin chi tiết bài tập
    /// </summary>
    /// <param name="id">ID bài tập</param>
    [HttpGet("{id}")]
    public async Task<ActionResult<LessonExerciseDto>> GetExercise(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var exercise = await _exerciseService.GetExerciseByIdAsync(id, userId!);
        
        if (exercise == null)
            return NotFound(new { message = "Bài tập không tồn tại" });

        if (exercise.IsLocked)
            return Forbid("Bạn chưa hoàn thành bài tập trước đó");

        return Ok(exercise);
    }

    /// <summary>
    /// Kiểm tra trạng thái mở khóa của bài tập
    /// </summary>
    /// <param name="id">ID bài tập</param>
    [HttpGet("{id}/unlock-status")]
    public async Task<ActionResult> GetUnlockStatus(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isLocked = await _exerciseService.CheckExerciseUnlockStatusAsync(id, userId!);
        
        return Ok(new { exerciseId = id, isLocked });
    }
}

