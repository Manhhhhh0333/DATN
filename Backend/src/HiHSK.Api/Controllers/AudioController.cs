using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text;

namespace HiHSK.Api.Controllers;

/// <summary>
/// Controller để generate audio bằng Text-to-Speech
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AudioController : ControllerBase
{
    /// <summary>
    /// Generate audio URL cho từ vựng tiếng Trung bằng Text-to-Speech
    /// </summary>
    /// <param name="text">Text cần phát âm (chữ Hán)</param>
    /// <param name="lang">Ngôn ngữ (mặc định: zh-CN)</param>
    /// <returns>URL audio hoặc redirect đến audio service</returns>
    [HttpGet("tts")]
    public IActionResult GetTTS([FromQuery] string text, [FromQuery] string lang = "zh-CN")
    {
        if (string.IsNullOrWhiteSpace(text))
        {
            return BadRequest(new { message = "Text không được để trống" });
        }

        // Option 1: Redirect đến Google TTS (miễn phí, không cần API key)
        // Lưu ý: Google có thể chặn nếu request quá nhiều
        var encodedText = Uri.EscapeDataString(text);
        var googleTtsUrl = $"https://translate.google.com/translate_tts?ie=UTF-8&tl={lang}&client=tw-ob&q={encodedText}";
        
        // Redirect đến Google TTS
        return Redirect(googleTtsUrl);
        
        // Option 2: Trả về URL để frontend tự xử lý
        // return Ok(new { audioUrl = googleTtsUrl });
        
        // Option 3: Generate audio file và trả về (cần thư viện TTS)
        // var audioBytes = GenerateAudioBytes(text, lang);
        // return File(audioBytes, "audio/mpeg", "word.mp3");
    }

    /// <summary>
    /// Lấy audio URL cho từ vựng (chỉ trả về URL, không redirect)
    /// </summary>
    [HttpGet("tts-url")]
    public IActionResult GetTTSUrl([FromQuery] string text, [FromQuery] string lang = "zh-CN")
    {
        if (string.IsNullOrWhiteSpace(text))
        {
            return BadRequest(new { message = "Text không được để trống" });
        }

        var encodedText = Uri.EscapeDataString(text);
        
        // Google TTS URL
        var audioUrl = $"https://translate.google.com/translate_tts?ie=UTF-8&tl={lang}&client=tw-ob&q={encodedText}";
        
        // Hoặc có thể dùng Baidu TTS (tốt hơn cho tiếng Trung)
        // var audioUrl = $"https://fanyi.baidu.com/gettts?lan=zh&text={encodedText}&spd=3&source=web";
        
        return Ok(new { audioUrl });
    }

    /// <summary>
    /// Proxy audio từ Google TTS để tránh lỗi CORS
    /// </summary>
    /// <param name="text">Text cần phát âm (chữ Hán)</param>
    /// <param name="lang">Ngôn ngữ (mặc định: zh-CN)</param>
    /// <returns>Audio stream</returns>
    [HttpGet("proxy")]
    [AllowAnonymous]
    public async Task<IActionResult> ProxyAudio([FromQuery] string text, [FromQuery] string lang = "zh-CN")
    {
        if (string.IsNullOrWhiteSpace(text))
        {
            return BadRequest(new { message = "Text không được để trống" });
        }

        try
        {
            var encodedText = Uri.EscapeDataString(text);
            var googleTtsUrl = $"https://translate.google.com/translate_tts?ie=UTF-8&tl={lang}&client=tw-ob&q={encodedText}";

            using var httpClient = new HttpClient();
            httpClient.Timeout = TimeSpan.FromSeconds(10);
            
            // Set User-Agent để tránh bị chặn
            httpClient.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");

            var response = await httpClient.GetAsync(googleTtsUrl);
            
            if (!response.IsSuccessStatusCode)
            {
                return StatusCode((int)response.StatusCode, new { message = "Không thể tải audio từ Google TTS" });
            }

            var audioBytes = await response.Content.ReadAsByteArrayAsync();
            var contentType = response.Content.Headers.ContentType?.MediaType ?? "audio/mpeg";

            // Set CORS headers
            Response.Headers.Add("Access-Control-Allow-Origin", "*");
            Response.Headers.Add("Access-Control-Allow-Methods", "GET");
            Response.Headers.Add("Cache-Control", "public, max-age=3600"); // Cache 1 giờ

            return File(audioBytes, contentType);
        }
        catch (TaskCanceledException)
        {
            return StatusCode(408, new { message = "Request timeout" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi tải audio", error = ex.Message });
        }
    }
}

