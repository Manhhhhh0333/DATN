using HiHSK.Application.DTOs;
using HiHSK.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HiHSK.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CoursesController : ControllerBase
{
    private readonly ICourseService _courseService;

    public CoursesController(ICourseService courseService)
    {
        _courseService = courseService;
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
}















