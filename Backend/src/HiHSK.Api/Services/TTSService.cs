using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Caching.Memory;

namespace HiHSK.Api.Services;

/// <summary>
/// Service để xử lý Text-to-Speech với caching
/// </summary>
public class TTSService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<TTSService> _logger;
    private readonly IMemoryCache _memoryCache;
    private readonly string _cacheDirectory;
    private readonly TimeSpan _memoryCacheExpiration = TimeSpan.FromHours(12); // Cache trong memory 12 giờ
    private readonly TimeSpan _fileCacheExpiration = TimeSpan.FromDays(30); // Cache file 30 ngày

    public TTSService(HttpClient httpClient, ILogger<TTSService> logger, IWebHostEnvironment env, IMemoryCache memoryCache)
    {
        _httpClient = httpClient;
        _logger = logger;
        _memoryCache = memoryCache;
        
        // Tạo thư mục cache trong wwwroot/audio-cache
        _cacheDirectory = Path.Combine(env.WebRootPath ?? env.ContentRootPath, "audio-cache");
        
        if (!Directory.Exists(_cacheDirectory))
        {
            Directory.CreateDirectory(_cacheDirectory);
            _logger.LogInformation("Đã tạo thư mục cache: {CacheDirectory}", _cacheDirectory);
        }

        // Cấu hình HttpClient
        _httpClient.Timeout = TimeSpan.FromSeconds(15);
        _httpClient.DefaultRequestHeaders.Add("User-Agent", 
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
        _httpClient.DefaultRequestHeaders.Add("Accept", "audio/mpeg, audio/*, */*");
        _httpClient.DefaultRequestHeaders.Add("Accept-Language", "en-US,en;q=0.9");
        _httpClient.DefaultRequestHeaders.Add("Referer", "https://translate.google.com/");
    }

    /// <summary>
    /// Lấy audio từ Google TTS với caching (memory cache 12h + file cache 30 ngày)
    /// </summary>
    public async Task<(Stream? AudioStream, string ContentType)> GetAudioStreamAsync(string text, string lang = "zh-CN")
    {
        if (string.IsNullOrWhiteSpace(text))
        {
            _logger.LogWarning("Text rỗng khi gọi GetAudioStreamAsync");
            return (null, "audio/mpeg");
        }

        // Clean text: loại bỏ BOM và trim
        text = text.Trim().Replace("\uFEFF", "").Replace("\xEF\xBB\xBF", "");
        
        if (string.IsNullOrWhiteSpace(text))
        {
            _logger.LogWarning("Text sau khi clean vẫn rỗng");
            return (null, "audio/mpeg");
        }

        // Tạo cache key từ text và lang
        var memoryCacheKey = $"tts_{lang}_{text}";
        var fileCacheKey = GenerateCacheKey(text, lang);
        var cachePath = Path.Combine(_cacheDirectory, fileCacheKey);

        // 1. Kiểm tra memory cache trước (12h)
        if (_memoryCache.TryGetValue<byte[]>(memoryCacheKey, out var cachedBytes) && cachedBytes != null)
        {
            _logger.LogInformation("Sử dụng memory cache cho text: {Text}, lang: {Lang}", text, lang);
            return (new MemoryStream(cachedBytes), "audio/mpeg");
        }

        // 2. Kiểm tra file cache (30 ngày)
        if (File.Exists(cachePath))
        {
            var fileInfo = new FileInfo(cachePath);
            if (DateTime.UtcNow - fileInfo.LastWriteTimeUtc < _fileCacheExpiration)
            {
                _logger.LogInformation("Sử dụng file cache cho text: {Text}, lang: {Lang}", text, lang);
                try
                {
                    var fileBytes = await File.ReadAllBytesAsync(cachePath);
                    
                    // Lưu vào memory cache
                    _memoryCache.Set(memoryCacheKey, fileBytes, _memoryCacheExpiration);
                    
                    return (new MemoryStream(fileBytes), "audio/mpeg");
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Lỗi khi đọc cache file, sẽ fetch lại từ Google TTS");
                }
            }
            else
            {
                _logger.LogInformation("File cache đã hết hạn, xóa file cũ: {CachePath}", cachePath);
                try
                {
                    File.Delete(cachePath);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Không thể xóa cache file cũ: {CachePath}", cachePath);
                }
            }
        }

        // 3. Fetch từ Google TTS
        try
        {
            var audioBytes = await FetchFromGoogleTTSAsync(text, lang);
            
            if (audioBytes != null && audioBytes.Length > 0)
            {
                // Lưu vào memory cache (12h)
                _memoryCache.Set(memoryCacheKey, audioBytes, _memoryCacheExpiration);
                _logger.LogInformation("Đã lưu vào memory cache cho text: {Text}, lang: {Lang}", text, lang);
                
                // Lưu vào file cache (30 ngày)
                try
                {
                    await File.WriteAllBytesAsync(cachePath, audioBytes);
                    _logger.LogInformation("Đã lưu vào file cache cho text: {Text}, lang: {Lang}, size: {Size} bytes", 
                        text, lang, audioBytes.Length);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Không thể lưu cache file: {CachePath}", cachePath);
                    // Tiếp tục trả về audio dù không lưu được cache
                }

                return (new MemoryStream(audioBytes), "audio/mpeg");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi fetch audio từ Google TTS cho text: {Text}, lang: {Lang}", text, lang);
            throw;
        }

        return (null, "audio/mpeg");
    }

    /// <summary>
    /// Fetch audio từ Google TTS với kiểm tra response content
    /// </summary>
    private async Task<byte[]?> FetchFromGoogleTTSAsync(string text, string lang)
    {
        var encodedText = Uri.EscapeDataString(text);
        var googleTtsUrl = $"https://translate.google.com/translate_tts?ie=UTF-8&tl={lang}&client=tw-ob&q={encodedText}";

        _logger.LogInformation("Fetching audio từ Google TTS: {Url}", googleTtsUrl);

        try
        {
            var response = await _httpClient.GetAsync(googleTtsUrl);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Google TTS trả về status code: {StatusCode} cho text: {Text}", 
                    response.StatusCode, text);
                
                // Đọc response body để log chi tiết
                try
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Response body: {ErrorContent}", errorContent.Substring(0, Math.Min(500, errorContent.Length)));
                }
                catch { }
                
                return null;
            }

            // Kiểm tra Content-Type để đảm bảo không phải HTML
            var contentType = response.Content.Headers.ContentType?.MediaType ?? "";
            if (contentType.Contains("text/html") || contentType.Contains("text/plain"))
            {
                _logger.LogError("Google TTS trả về HTML/text thay vì audio cho text: {Text}, ContentType: {ContentType}", 
                    text, contentType);
                
                // Đọc response để xem lỗi gì
                try
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Response body (HTML/text): {ErrorContent}", 
                        errorContent.Substring(0, Math.Min(500, errorContent.Length)));
                }
                catch { }
                
                return null;
            }

            var audioBytes = await response.Content.ReadAsByteArrayAsync();
            
            if (audioBytes == null || audioBytes.Length == 0)
            {
                _logger.LogWarning("Audio bytes rỗng từ Google TTS cho text: {Text}", text);
                return null;
            }

            // Kiểm tra xem có phải HTML không (Google có thể trả về HTML trong byte array)
            if (audioBytes.Length > 100)
            {
                var header = Encoding.UTF8.GetString(audioBytes, 0, Math.Min(100, audioBytes.Length));
                if (header.Contains("<!DOCTYPE") || header.Contains("<html") || header.Contains("<HTML"))
                {
                    _logger.LogError("Google TTS trả về HTML trong byte array cho text: {Text}", text);
                    return null;
                }
            }

            _logger.LogInformation("Đã fetch thành công audio từ Google TTS, size: {Size} bytes, ContentType: {ContentType} cho text: {Text}", 
                audioBytes.Length, contentType, text);
            
            return audioBytes;
        }
        catch (TaskCanceledException)
        {
            _logger.LogError("Timeout khi fetch audio từ Google TTS cho text: {Text}", text);
            throw new TimeoutException("Request timeout khi fetch audio từ Google TTS");
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "HTTP error khi fetch audio từ Google TTS cho text: {Text}", text);
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi không xác định khi fetch audio từ Google TTS cho text: {Text}", text);
            throw;
        }
    }

    /// <summary>
    /// Tạo cache key từ text và lang (dùng hash để tránh tên file quá dài)
    /// </summary>
    private string GenerateCacheKey(string text, string lang)
    {
        var input = $"{lang}_{text}";
        var bytes = Encoding.UTF8.GetBytes(input);
        var hash = SHA256.HashData(bytes);
        var hashString = Convert.ToHexString(hash).ToLowerInvariant();
        return $"{hashString}.mp3";
    }

    /// <summary>
    /// Xóa cache cũ (có thể gọi định kỳ)
    /// </summary>
    public void CleanExpiredCache()
    {
        try
        {
            if (!Directory.Exists(_cacheDirectory))
                return;

            var files = Directory.GetFiles(_cacheDirectory, "*.mp3");
            var deletedCount = 0;

            foreach (var file in files)
            {
                var fileInfo = new FileInfo(file);
                if (DateTime.UtcNow - fileInfo.LastWriteTimeUtc > _fileCacheExpiration)
                {
                    try
                    {
                        File.Delete(file);
                        deletedCount++;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Không thể xóa cache file: {File}", file);
                    }
                }
            }

            if (deletedCount > 0)
            {
                _logger.LogInformation("Đã xóa {Count} cache file hết hạn", deletedCount);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi clean expired cache");
        }
    }
}

