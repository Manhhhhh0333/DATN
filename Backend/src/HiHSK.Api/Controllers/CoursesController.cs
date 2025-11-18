using HiHSK.Application.DTOs;
using HiHSK.Application.Interfaces;
using HiHSK.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HiHSK.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CoursesController : ControllerBase
{
    private readonly ICourseService _courseService;
    private readonly ApplicationDbContext _context;
    private readonly IVocabularyService _vocabularyService;

    public CoursesController(ICourseService courseService, ApplicationDbContext context, IVocabularyService vocabularyService)
    {
        _courseService = courseService;
        _context = context;
        _vocabularyService = vocabularyService;
    }

    /// <summary>
    /// Lấy danh sách khóa học theo cấp độ HSK
    /// </summary>
    /// <param name="hskLevel">Cấp độ HSK (1-6), null để lấy tất cả</param>
    [HttpGet]
    public async Task<ActionResult<List<CourseListDto>>> GetCourses([FromQuery] int? hskLevel)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var courses = await _courseService.GetCoursesByHSKLevelAsync(hskLevel, userId);
        return Ok(courses);
    }

    /// <summary>
    /// Lấy thông tin chi tiết khóa học
    /// </summary>
    /// <param name="id">ID khóa học</param>
    [HttpGet("{id}")]
    public async Task<ActionResult<CourseDto>> GetCourse(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var course = await _courseService.GetCourseByIdAsync(id, userId);
        
        if (course == null)
            return NotFound(new { message = "Khóa học không tồn tại" });

        return Ok(course);
    }

    /// <summary>
    /// Lấy từ vựng theo HSK level và phần (part)
    /// </summary>
    /// <param name="hskLevel">Cấp độ HSK (1-6)</param>
    /// <param name="partNumber">Số phần (1-10), mỗi phần có 15 từ</param>
    [HttpGet("hsk/{hskLevel}/part/{partNumber}")]
    [AllowAnonymous]
    public async Task<ActionResult<List<WordWithProgressDto>>> GetWordsByHSKLevelAndPart(
        int hskLevel,
        int partNumber)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

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

}















