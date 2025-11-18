using HiHSK.Application.DTOs;
using HiHSK.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HiHSK.Api.Controllers;

[ApiController]
[Route("api/lessonexercises")]
[AllowAnonymous]
public class LessonExercisesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public LessonExercisesController(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Lấy danh sách bài tập theo chủ đề
    /// </summary>
    /// <param name="topicId">ID của chủ đề</param>
    [HttpGet("topic/{topicId}")]
    public async Task<ActionResult<List<LessonExerciseListDto>>> GetExercisesByTopic(int topicId)
    {
        try
        {
            var exercises = await _context.LessonExercises
                .Where(e => e.TopicId == topicId && e.IsActive)
                .OrderBy(e => e.ExerciseIndex)
                .Select(e => new LessonExerciseListDto
                {
                    Id = e.Id,
                    TopicId = e.TopicId,
                    ExerciseType = e.ExerciseType,
                    Title = e.Title,
                    Description = e.Description,
                    ExerciseIndex = e.ExerciseIndex,
                    IsLocked = e.IsLocked,
                    IsCompleted = false, // TODO: Implement completion check based on user progress
                    ExerciseTypeName = e.ExerciseType // TODO: Map to display name
                })
                .ToListAsync();

            return Ok(exercises);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new 
            { 
                message = "Lỗi khi lấy danh sách bài tập",
                error = ex.Message,
                hint = "Vui lòng kiểm tra xem bảng LessonExercises đã được tạo trong database chưa"
            });
        }
    }

    /// <summary>
    /// Lấy chi tiết bài tập
    /// </summary>
    /// <param name="id">ID của bài tập</param>
    [HttpGet("{id}")]
    public async Task<ActionResult<LessonExerciseDto>> GetExerciseById(int id)
    {
        try
        {
            var exercise = await _context.LessonExercises
                .Include(e => e.Questions)
                    .ThenInclude(q => q.QuestionOptions)
                .Include(e => e.Dialogues)
                    .ThenInclude(d => d.Questions)
                        .ThenInclude(q => q.QuestionOptions)
                .Include(e => e.ReadingPassages)
                    .ThenInclude(r => r.Questions)
                        .ThenInclude(q => q.QuestionOptions)
                .Include(e => e.SentencePatterns)
                .FirstOrDefaultAsync(e => e.Id == id && e.IsActive);

            if (exercise == null)
                return NotFound(new { message = "Bài tập không tồn tại" });

            var exerciseDto = new LessonExerciseDto
            {
                Id = exercise.Id,
                TopicId = exercise.TopicId,
                ExerciseType = exercise.ExerciseType,
                Title = exercise.Title,
                Description = exercise.Description,
                ExerciseIndex = exercise.ExerciseIndex,
                IsLocked = exercise.IsLocked,
                IsCompleted = false, // TODO: Implement completion check
                ExerciseTypeName = exercise.ExerciseType, // TODO: Map to display name
                PrerequisiteExerciseId = exercise.PrerequisiteExerciseId,
                Questions = exercise.Questions?.Select(q => new QuestionDto
                {
                    Id = q.Id,
                    QuestionType = q.QuestionType,
                    QuestionText = q.QuestionText,
                    AudioUrl = q.AudioUrl,
                    Points = q.Points,
                    Explanation = q.Explanation,
                    Options = q.QuestionOptions?.Select(o => new QuestionOptionDto
                    {
                        Id = o.Id,
                        OptionText = o.OptionText,
                        OptionLabel = o.OptionLabel,
                        IsCorrect = o.IsCorrect
                    }).ToList() ?? new List<QuestionOptionDto>()
                }).ToList(),
                Dialogues = exercise.Dialogues?.Select(d => new DialogueDto
                {
                    Id = d.Id,
                    LessonId = d.LessonId,
                    Title = d.Title,
                    DialogueText = d.DialogueText,
                    Pinyin = d.Pinyin,
                    Translation = d.Translation,
                    AudioUrl = d.AudioUrl,
                    DifficultyLevel = d.DifficultyLevel,
                    Category = d.Category,
                    Questions = d.Questions?.Select(q => new QuestionDto
                    {
                        Id = q.Id,
                        QuestionType = q.QuestionType,
                        QuestionText = q.QuestionText,
                        AudioUrl = q.AudioUrl,
                        Points = q.Points,
                        Explanation = q.Explanation,
                        Options = q.QuestionOptions?.Select(o => new QuestionOptionDto
                        {
                            Id = o.Id,
                            OptionText = o.OptionText,
                            OptionLabel = o.OptionLabel,
                            IsCorrect = o.IsCorrect
                        }).ToList() ?? new List<QuestionOptionDto>()
                    }).ToList() ?? new List<QuestionDto>()
                }).ToList(),
                ReadingPassages = exercise.ReadingPassages?.Select(r => new ReadingPassageDto
                {
                    Id = r.Id,
                    LessonId = r.LessonId,
                    Title = r.Title,
                    PassageText = r.PassageText,
                    Pinyin = r.Pinyin,
                    Translation = r.Translation,
                    DifficultyLevel = r.DifficultyLevel,
                    WordCount = r.WordCount,
                    Category = r.Category,
                    ImageUrl = r.ImageUrl,
                    Questions = r.Questions?.Select(q => new QuestionDto
                    {
                        Id = q.Id,
                        QuestionType = q.QuestionType,
                        QuestionText = q.QuestionText,
                        AudioUrl = q.AudioUrl,
                        Points = q.Points,
                        Explanation = q.Explanation,
                        Options = q.QuestionOptions?.Select(o => new QuestionOptionDto
                        {
                            Id = o.Id,
                            OptionText = o.OptionText,
                            OptionLabel = o.OptionLabel,
                            IsCorrect = o.IsCorrect
                        }).ToList() ?? new List<QuestionOptionDto>()
                    }).ToList() ?? new List<QuestionDto>()
                }).ToList(),
                SentencePatterns = exercise.SentencePatterns?.Select(s => new SentencePatternDto
                {
                    Id = s.Id,
                    LessonId = s.LessonId,
                    PatternText = s.PatternText,
                    Pinyin = s.Pinyin,
                    Meaning = s.Meaning,
                    Usage = s.Usage,
                    ExampleSentences = s.ExampleSentences,
                    Category = s.Category,
                    DifficultyLevel = s.DifficultyLevel
                }).ToList()
            };

            return Ok(exerciseDto);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new 
            { 
                message = "Lỗi khi lấy chi tiết bài tập",
                error = ex.Message
            });
        }
    }

    /// <summary>
    /// Kiểm tra trạng thái mở khóa
    /// </summary>
    /// <param name="id">ID của bài tập</param>
    [HttpGet("{id}/unlock-status")]
    public async Task<ActionResult<object>> GetUnlockStatus(int id)
    {
        var exercise = await _context.LessonExercises.FindAsync(id);
        
        if (exercise == null)
            return NotFound(new { message = "Bài tập không tồn tại" });

        return Ok(new { exerciseId = id, isLocked = exercise.IsLocked });
    }
}

