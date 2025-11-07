using HiHSK.Domain.Entities;
using HiHSK.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IO;

namespace HiHSK.Api.Controllers;

/// <summary>
/// Controller cho các chức năng quản trị (Admin)
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize] // Có thể thêm role check: [Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<AdminController> _logger;

    public AdminController(ApplicationDbContext context, ILogger<AdminController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Seed dữ liệu từ file JSON vào database
    /// </summary>
    /// <param name="fileName">Tên file JSON trong thư mục data (ví dụ: seed-data-hsk1.json)</param>
    /// <param name="clearExisting">Xóa dữ liệu cũ trước khi seed (mặc định: false)</param>
    [HttpPost("seed")]
    public async Task<IActionResult> SeedData(
        [FromQuery] string fileName = "seed-data-hsk1.json",
        [FromQuery] bool clearExisting = false)
    {
        try
        {
            // Đường dẫn file JSON
            var dataFolder = Path.Combine(
                Directory.GetCurrentDirectory(),
                "..", "..", "..", "..", "data", fileName
            );

            // Hoặc nếu file ở trong thư mục data của project
            if (!System.IO.File.Exists(dataFolder))
            {
                dataFolder = Path.Combine(
                    Directory.GetCurrentDirectory(),
                    "..", "..", "data", fileName
                );
            }

            if (!System.IO.File.Exists(dataFolder))
            {
                return NotFound(new { message = $"Không tìm thấy file: {fileName}", path = dataFolder });
            }

            _logger.LogInformation($"Bắt đầu seed data từ file: {dataFolder}");

            // Xóa dữ liệu cũ nếu được yêu cầu
            if (clearExisting)
            {
                _logger.LogWarning("Đang xóa dữ liệu cũ...");
                await ClearExistingDataAsync();
            }

            // Seed data
            var seeder = new DataSeeder(_context);
            await seeder.SeedFromJsonAsync(dataFolder);

            // Đếm số lượng dữ liệu đã seed
            var stats = new
            {
                courseCategories = await _context.CourseCategories.CountAsync(),
                courses = await _context.Courses.CountAsync(),
                lessons = await _context.Lessons.CountAsync(),
                words = await _context.Words.CountAsync(),
                questions = await _context.Questions.CountAsync()
            };

            _logger.LogInformation($"Seed data thành công! Stats: {System.Text.Json.JsonSerializer.Serialize(stats)}");

            return Ok(new
            {
                message = "Seed data thành công!",
                stats = stats
            });
        }
        catch (FileNotFoundException ex)
        {
            _logger.LogError(ex, "File không tồn tại");
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi seed data");
            return StatusCode(500, new { message = "Lỗi khi seed data", error = ex.Message });
        }
    }

    /// <summary>
    /// Xóa tất cả dữ liệu seed (cẩn thận!)
    /// </summary>
    [HttpPost("clear-data")]
    public async Task<IActionResult> ClearData()
    {
        try
        {
            await ClearExistingDataAsync();
            return Ok(new { message = "Đã xóa tất cả dữ liệu seed" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi xóa dữ liệu");
            return StatusCode(500, new { message = "Lỗi khi xóa dữ liệu", error = ex.Message });
        }
    }

    /// <summary>
    /// Lấy thống kê dữ liệu hiện tại
    /// </summary>
    [HttpGet("stats")]
    [AllowAnonymous] // Tạm thời cho phép không cần auth để kiểm tra
    public async Task<IActionResult> GetStats()
    {
        var stats = new
        {
            courseCategories = await _context.CourseCategories.CountAsync(),
            courses = await _context.Courses.CountAsync(),
            lessons = await _context.Lessons.CountAsync(),
            words = await _context.Words.CountAsync(),
            questions = await _context.Questions.CountAsync(),
            questionOptions = await _context.QuestionOptions.CountAsync(),
            vocabularyTopics = await _context.VocabularyTopics.CountAsync()
        };

        return Ok(stats);
    }

    /// <summary>
    /// Seed Vocabulary Topic cho HSK1 và gán tất cả từ vựng HSK1 vào topic
    /// </summary>
    [HttpPost("seed-vocabulary-topic-hsk1")]
    [AllowAnonymous] // Tạm thời cho phép không cần auth để seed data
    public async Task<IActionResult> SeedVocabularyTopicHsk1()
    {
        try
        {
            _logger.LogInformation("Bắt đầu seed Vocabulary Topic HSK1...");

            // Kiểm tra xem Vocabulary Topic HSK1 đã tồn tại chưa (theo tên hoặc Id)
            var existingTopic = await _context.VocabularyTopics
                .FirstOrDefaultAsync(t => t.Name == "HSK 1" || t.Id == 1);

            int topicId;
            if (existingTopic == null)
            {
                // Tạo Vocabulary Topic HSK1 - không set Id, để database tự generate
                var vocabularyTopic = new VocabularyTopic
                {
                    Name = "HSK 1",
                    Description = "Từ vựng HSK Cấp độ 1 - 150 từ vựng cơ bản",
                    ImageUrl = null,
                    SortOrder = 1
                };

                _context.VocabularyTopics.Add(vocabularyTopic);
                await _context.SaveChangesAsync();
                topicId = vocabularyTopic.Id;
                _logger.LogInformation($"Đã tạo Vocabulary Topic HSK1 (Id={topicId})");
            }
            else
            {
                topicId = existingTopic.Id;
                _logger.LogInformation($"Vocabulary Topic HSK1 đã tồn tại (Id={topicId}), bỏ qua tạo mới");
            }

            // Lấy tất cả từ vựng HSK1
            var hsk1Words = await _context.Words
                .Where(w => w.HSKLevel == 1)
                .ToListAsync();

            _logger.LogInformation($"Tìm thấy {hsk1Words.Count} từ vựng HSK1");

            if (hsk1Words.Count == 0)
            {
                return BadRequest(new
                {
                    message = "Không tìm thấy từ vựng HSK1. Vui lòng seed từ vựng trước.",
                    vocabularyTopicId = topicId
                });
            }

            // Gán từ vựng vào Vocabulary Topic (tránh duplicate) - sử dụng batch insert
            int addedCount = 0;
            var linksToAdd = new List<WordVocabularyTopic>();

            foreach (var word in hsk1Words)
            {
                var existingLink = await _context.WordVocabularyTopics
                    .FirstOrDefaultAsync(wvt => wvt.WordId == word.Id && wvt.VocabularyTopicId == topicId);

                if (existingLink == null)
                {
                    linksToAdd.Add(new WordVocabularyTopic
                    {
                        WordId = word.Id,
                        VocabularyTopicId = topicId
                    });
                }
            }

            if (linksToAdd.Count > 0)
            {
                _context.WordVocabularyTopics.AddRange(linksToAdd);
                await _context.SaveChangesAsync();
                addedCount = linksToAdd.Count;
                _logger.LogInformation($"Đã gán {addedCount} từ vựng vào Vocabulary Topic HSK1 (Id={topicId})");
            }
            else
            {
                _logger.LogInformation($"Tất cả từ vựng đã được gán vào Vocabulary Topic HSK1 (Id={topicId})");
            }

            return Ok(new
            {
                message = "Seed Vocabulary Topic HSK1 thành công!",
                vocabularyTopicId = topicId,
                totalWords = hsk1Words.Count,
                addedWords = addedCount,
                existingWords = hsk1Words.Count - addedCount
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi seed Vocabulary Topic HSK1");
            
            // Log inner exception nếu có
            var errorMessage = ex.Message;
            if (ex.InnerException != null)
            {
                errorMessage += $" | Inner: {ex.InnerException.Message}";
                _logger.LogError(ex.InnerException, "Inner exception");
            }

            return StatusCode(500, new 
            { 
                message = "Lỗi khi seed Vocabulary Topic HSK1", 
                error = errorMessage,
                details = ex.ToString()
            });
        }
    }

    private async Task ClearExistingDataAsync()
    {
        // Xóa theo thứ tự để tránh lỗi Foreign Key
        _context.QuestionOptions.RemoveRange(_context.QuestionOptions);
        _context.Questions.RemoveRange(_context.Questions);
        _context.Words.RemoveRange(_context.Words);
        _context.Lessons.RemoveRange(_context.Lessons);
        _context.Courses.RemoveRange(_context.Courses);
        _context.CourseCategories.RemoveRange(_context.CourseCategories);
        
        await _context.SaveChangesAsync();
    }
}

