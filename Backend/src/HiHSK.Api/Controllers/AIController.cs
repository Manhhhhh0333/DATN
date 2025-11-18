
using HiHSK.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace HiHSK.Api.Controllers;

[ApiController]
[Route("api/ai")]
[Authorize]
public class AIController : ControllerBase
{
    private readonly GeminiService _geminiService;

    public AIController(GeminiService geminiService)
    {
        _geminiService = geminiService;
    }

    /// <summary>
    /// Generate 3 ví dụ cho từ vựng sử dụng Google Gemini AI
    /// </summary>
    /// <param name="request">Request chứa từ vựng cần generate ví dụ</param>
    /// <returns>Danh sách 3 ví dụ (Chữ Hán, Pinyin, Nghĩa)</returns>
    [HttpPost("generate-example")]
    public async Task<IActionResult> GenerateExample([FromBody] GenerateExampleRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Word))
        {
            return BadRequest(new { message = "Từ vựng không được để trống" });
        }

        try
        {
            var examples = await _geminiService.GenerateExamplesAsync(request.Word);
            
            return Ok(new
            {
                word = request.Word,
                examples = examples,
                count = examples.Count
            });
        }
        catch (Exception ex)
        {
            // Log chi tiết lỗi để debug
            Console.WriteLine($"[AIController] Lỗi khi generate examples: {ex.Message}");
            Console.WriteLine($"[AIController] StackTrace: {ex.StackTrace}");
            
            return StatusCode(500, new
            {
                message = "Lỗi khi generate examples từ AI",
                error = ex.Message,
                innerException = ex.InnerException?.Message
            });
        }
    }

    /// <summary>
    /// Test kết nối đến Gemini API (không cần authentication)
    /// </summary>
    [HttpPost("test-connection")]
    [AllowAnonymous]
    public IActionResult TestConnection()
    {
        try
        {
            var configuration = HttpContext.RequestServices.GetRequiredService<IConfiguration>();
            var apiKey = configuration["GeminiSettings:ApiKey"];
            
            if (string.IsNullOrEmpty(apiKey))
            {
                return BadRequest(new { message = "API Key chưa được cấu hình" });
            }

            return Ok(new
            {
                message = "API Key đã được cấu hình",
                apiKeyPrefix = apiKey.Substring(0, Math.Min(10, apiKey.Length)) + "...",
                apiKeyLength = apiKey.Length
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi test connection", error = ex.Message });
        }
    }

    /// <summary>
    /// Lấy danh sách models có sẵn từ Gemini API (không cần authentication)
    /// </summary>
    [HttpGet("available-models")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAvailableModels()
    {
        try
        {
            var models = await _geminiService.GetAvailableModelsAsync();
            
            return Ok(new
            {
                message = "Danh sách models có sẵn",
                models = models,
                count = models.Count
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new 
            { 
                message = "Lỗi khi lấy danh sách models", 
                error = ex.Message,
                innerException = ex.InnerException?.Message
            });
        }
    }
}

/// <summary>
/// Request model cho generate example
/// </summary>
public class GenerateExampleRequest
{
    public string Word { get; set; } = string.Empty;
}
