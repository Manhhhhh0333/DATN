using HiHSK.Application.DTOs;
using HiHSK.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HiHSK.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LessonTopicsController : ControllerBase
{
    private readonly ILessonTopicService _topicService;

    public LessonTopicsController(ILessonTopicService topicService)
    {
        _topicService = topicService;
    }

    /// <summary>
    /// Lấy danh sách chủ đề theo cấp độ HSK
    /// </summary>
    /// <param name="hskLevel">Cấp độ HSK (1-6)</param>
    [HttpGet("hsk/{hskLevel}")]
    public async Task<ActionResult<List<LessonTopicListDto>>> GetTopicsByHSKLevel(int hskLevel)
    {
        if (hskLevel < 1 || hskLevel > 6)
        {
            return BadRequest(new { message = "HSK Level phải từ 1 đến 6" });
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var topics = await _topicService.GetTopicsByHSKLevelAsync(hskLevel, userId!);
        return Ok(topics);
    }

    /// <summary>
    /// Lấy thông tin chi tiết chủ đề
    /// </summary>
    /// <param name="id">ID chủ đề</param>
    [HttpGet("{id}")]
    public async Task<ActionResult<LessonTopicDto>> GetTopic(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var topic = await _topicService.GetTopicByIdAsync(id, userId!);
        
        if (topic == null)
            return NotFound(new { message = "Chủ đề không tồn tại" });

        if (topic.IsLocked)
            return Forbid("Bạn chưa hoàn thành chủ đề trước đó");

        return Ok(topic);
    }

    /// <summary>
    /// Kiểm tra trạng thái mở khóa của chủ đề
    /// </summary>
    /// <param name="id">ID chủ đề</param>
    [HttpGet("{id}/unlock-status")]
    public async Task<ActionResult> GetUnlockStatus(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isLocked = await _topicService.CheckTopicUnlockStatusAsync(id, userId!);
        
        return Ok(new { topicId = id, isLocked });
    }
}

