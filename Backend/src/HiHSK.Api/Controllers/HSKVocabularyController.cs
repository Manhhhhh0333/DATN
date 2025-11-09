using HiHSK.Application.DTOs;
using HiHSK.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HiHSK.Api.Controllers;

[ApiController]
[Route("api/hsk-vocabulary")]
[Authorize]
public class HSKVocabularyController : ControllerBase
{
    private readonly IVocabularyService _vocabularyService;

    public HSKVocabularyController(IVocabularyService vocabularyService)
    {
        _vocabularyService = vocabularyService;
    }

    /// <summary>
    /// Lấy từ vựng theo HSK level và phần (part)
    /// </summary>
    /// <param name="hskLevel">Cấp độ HSK (1-6)</param>
    /// <param name="partNumber">Số phần (1-10), mỗi phần có 15 từ</param>
    [HttpGet("hsk/{hskLevel}/part/{partNumber}")]
    public async Task<ActionResult<List<WordWithProgressDto>>> GetWordsByHSKLevelAndPart(
        int hskLevel,
        int partNumber)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { message = "User not authenticated" });

        if (hskLevel < 1 || hskLevel > 6)
        {
            return BadRequest(new { message = "HSK level must be between 1 and 6" });
        }

        if (partNumber < 1 || partNumber > 10)
        {
            return BadRequest(new { message = "Part number must be between 1 and 10" });
        }

        try
        {
            var words = await _vocabularyService.GetWordsByHSKLevelAndPartAsync(hskLevel, partNumber, userId);
            return Ok(words);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while fetching words", error = ex.Message });
        }
    }

    /// <summary>
    /// Lấy hoặc tạo nhiều từ vựng cùng lúc (batch)
    /// Giúp giảm số lượng API calls khi cần lấy nhiều từ từ WordExamples
    /// </summary>
    /// <param name="request">Danh sách characters cần lấy</param>
    [HttpPost("words/batch")]
    public async Task<ActionResult<Dictionary<string, WordWithProgressDto>>> GetOrCreateWordsBatch([FromBody] BatchWordRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { message = "User not authenticated" });

        if (request?.Characters == null || !request.Characters.Any())
        {
            return BadRequest(new { message = "Characters không được để trống" });
        }

        if (request.Characters.Count > 50)
        {
            return BadRequest(new { message = "Tối đa 50 từ mỗi lần request" });
        }

        try
        {
            var result = await _vocabularyService.GetOrCreateWordsBatchAsync(request.Characters, userId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[HSKVocabularyController] Lỗi khi get/create words batch: {ex.Message}");
            return StatusCode(500, new { message = "An error occurred while getting/creating words", error = ex.Message });
        }
    }

    /// <summary>
    /// Lấy hoặc tạo từ vựng theo character
    /// Nếu từ đã có trong database → trả về chi tiết từ đó
    /// Nếu chưa có → gọi Gemini API để sinh dữ liệu mới và lưu vào DB
    /// </summary>
    /// <param name="character">Ký tự Hán cần tìm hoặc tạo</param>
    [HttpGet("word/{character}")]
    public async Task<ActionResult<WordWithProgressDto>> GetOrCreateWordByCharacter(string character)
    {
        // Log character nhận được để debug
        Console.WriteLine($"[HSKVocabularyController] Received character parameter: '{character}'");
        Console.WriteLine($"[HSKVocabularyController] Character length: {character?.Length ?? 0}");
        Console.WriteLine($"[HSKVocabularyController] Character bytes: {string.Join(", ", System.Text.Encoding.UTF8.GetBytes(character ?? ""))}");

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { message = "User not authenticated" });

        // ASP.NET Core tự động decode URL parameters, nhưng kiểm tra nếu vẫn còn encoded
        if (!string.IsNullOrWhiteSpace(character) && character.Contains("%"))
        {
            try
            {
                var decoded = Uri.UnescapeDataString(character);
                if (decoded != character)
                {
                    Console.WriteLine($"[HSKVocabularyController] Decoded character from '{character}' to '{decoded}'");
                    character = decoded;
                }
            }
            catch (Exception decodeEx)
            {
                Console.WriteLine($"[HSKVocabularyController] ⚠️ Lỗi khi decode URL: {decodeEx.Message}");
                // Tiếp tục với character gốc
            }
        }

        if (string.IsNullOrWhiteSpace(character))
        {
            return BadRequest(new { message = "Character không được để trống" });
        }

        try
        {
            var word = await _vocabularyService.GetOrCreateWordByCharacterAsync(character, userId);
            return Ok(word);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            // Log chi tiết lỗi để debug
            Console.WriteLine($"[HSKVocabularyController] Lỗi khi get/create word '{character}': {ex.Message}");
            Console.WriteLine($"[HSKVocabularyController] StackTrace: {ex.StackTrace}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"[HSKVocabularyController] InnerException: {ex.InnerException.Message}");
                Console.WriteLine($"[HSKVocabularyController] InnerStackTrace: {ex.InnerException.StackTrace}");
            }
            
            return StatusCode(500, new 
            { 
                message = "An error occurred while getting/creating word", 
                error = ex.Message,
                innerError = ex.InnerException?.Message,
                details = ex.ToString()
            });
        }
    }
}

public class BatchWordRequest
{
    public List<string> Characters { get; set; } = new();
}

