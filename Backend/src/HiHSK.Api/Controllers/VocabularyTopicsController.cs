using HiHSK.Application.DTOs;
using HiHSK.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HiHSK.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class VocabularyTopicsController : ControllerBase
{
    private readonly IVocabularyService _vocabularyService;
    private readonly ISRSService _srsService;

    public VocabularyTopicsController(
        IVocabularyService vocabularyService,
        ISRSService srsService)
    {
        _vocabularyService = vocabularyService;
        _srsService = srsService;
    }

    /// <summary>
    /// Lấy danh sách tất cả chủ đề từ vựng
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<VocabularyTopicDto>>> GetTopics()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { message = "User not authenticated" });
        
        var topics = await _vocabularyService.GetAllTopicsAsync(userId);
        return Ok(topics);
    }

    /// <summary>
    /// Lấy thông tin chi tiết chủ đề từ vựng
    /// </summary>
    /// <param name="id">ID chủ đề</param>
    [HttpGet("{id}")]
    public async Task<ActionResult<VocabularyTopicDetailDto>> GetTopic(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { message = "User not authenticated" });
        
        var topic = await _vocabularyService.GetTopicByIdAsync(id, userId);
        
        if (topic == null)
            return NotFound(new { message = "Chủ đề không tồn tại" });

        return Ok(topic);
    }

    /// <summary>
    /// Lấy danh sách từ vựng để ôn tập (flashcard)
    /// </summary>
    /// <param name="id">ID chủ đề</param>
    /// <param name="onlyDue">Chỉ lấy từ cần ôn hôm nay (mặc định: true)</param>
    /// <param name="limit">Giới hạn số từ (null = tất cả)</param>
    [HttpGet("{id}/review-words")]
    public async Task<ActionResult<List<FlashcardReviewDto>>> GetReviewWords(
        int id, 
        [FromQuery] bool onlyDue = true, 
        [FromQuery] int? limit = null)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { message = "User not authenticated" });
        
        var words = await _vocabularyService.GetWordsForReviewAsync(id, userId, onlyDue, limit);
        return Ok(words);
    }

    /// <summary>
    /// Cập nhật trạng thái ôn tập từ vựng (SRS)
    /// </summary>
    /// <param name="request">Thông tin đánh giá từ vựng</param>
    [HttpPost("review")]
    public async Task<ActionResult<UserWordProgressDto>> UpdateReviewStatus([FromBody] UpdateReviewStatusRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { message = "User not authenticated" });
        
        var progress = await _srsService.UpdateReviewStatusAsync(userId, request.WordId, request.Rating);
        return Ok(progress);
    }

    /// <summary>
    /// Lấy thống kê học tập của chủ đề
    /// </summary>
    /// <param name="id">ID chủ đề</param>
    [HttpGet("{id}/stats")]
    public async Task<ActionResult<ReviewStatsDto>> GetTopicStats(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { message = "User not authenticated" });
        
        var stats = await _vocabularyService.GetTopicStatsAsync(id, userId);
        return Ok(stats);
    }

    /// <summary>
    /// Lấy thống kê tổng quan học tập
    /// </summary>
    [HttpGet("stats/overall")]
    public async Task<ActionResult<ReviewStatsDto>> GetOverallStats()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { message = "User not authenticated" });
        
        var stats = await _vocabularyService.GetOverallStatsAsync(userId);
        return Ok(stats);
    }

    /// <summary>
    /// Lấy danh sách từ cần ôn tập hôm nay (tất cả chủ đề hoặc theo chủ đề)
    /// </summary>
    /// <param name="topicId">ID chủ đề (null = tất cả chủ đề)</param>
    /// <param name="limit">Giới hạn số từ</param>
    [HttpGet("review/due")]
    public async Task<ActionResult<List<FlashcardReviewDto>>> GetWordsDueForReview(
        [FromQuery] int? topicId = null,
        [FromQuery] int? limit = null)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { message = "User not authenticated" });
        
        var words = await _srsService.GetWordsDueForReviewAsync(userId, topicId, limit);
        return Ok(words);
    }
}

