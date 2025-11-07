using HiHSK.Application.DTOs;
using HiHSK.Application.Interfaces;

namespace HiHSK.Application.Services;

public class LessonService : ILessonService
{
    private readonly ILessonRepository _lessonRepository;
    private readonly IUserProgressRepository _userProgressRepository;

    public LessonService(
        ILessonRepository lessonRepository,
        IUserProgressRepository userProgressRepository)
    {
        _lessonRepository = lessonRepository;
        _userProgressRepository = userProgressRepository;
    }

    public async Task<List<LessonListDto>> GetLessonsByCourseIdAsync(int courseId, string userId)
    {
        var lessons = await _lessonRepository.GetLessonsByCourseIdAsync(courseId);
        var result = new List<LessonListDto>();

        foreach (var lesson in lessons)
        {
            var isCompleted = await _lessonRepository.IsLessonCompletedAsync(userId, lesson.Id);
            var isLocked = await CheckLessonUnlockStatusAsync(lesson.Id, userId);

            // Load lesson details để đếm Words và Questions
            var lessonDetails = await _lessonRepository.GetLessonWithDetailsAsync(lesson.Id);

            result.Add(new LessonListDto
            {
                Id = lesson.Id,
                CourseId = lesson.CourseId,
                Title = lesson.Title,
                Description = lesson.Description,
                LessonIndex = lesson.LessonIndex,
                IsLocked = isLocked,
                IsCompleted = isCompleted,
                PrerequisiteLessonId = lesson.PrerequisiteLessonId,
                TotalWords = lessonDetails?.Words.Count ?? 0,
                TotalQuestions = lessonDetails?.Questions.Count ?? 0
            });
        }

        return result;
    }

    public async Task<LessonDto?> GetLessonByIdAsync(int id, string userId)
    {
        var lesson = await _lessonRepository.GetLessonWithDetailsAsync(id);
        if (lesson == null)
            return null;

        var isCompleted = await _lessonRepository.IsLessonCompletedAsync(userId, lesson.Id);
        var isLocked = await CheckLessonUnlockStatusAsync(id, userId);

        return new LessonDto
        {
            Id = lesson.Id,
            CourseId = lesson.CourseId,
            CourseTitle = lesson.Course.Title,
            Title = lesson.Title,
            Description = lesson.Description,
            LessonIndex = lesson.LessonIndex,
            Content = lesson.Content,
            IsLocked = isLocked,
            IsCompleted = isCompleted,
            PrerequisiteLessonId = lesson.PrerequisiteLessonId,
            
            // Words - Từ vựng
            Words = lesson.Words.Select(w => new WordDto
            {
                Id = w.Id,
                Character = w.Character,
                Pinyin = w.Pinyin,
                Meaning = w.Meaning,
                AudioUrl = w.AudioUrl,
                ExampleSentence = w.ExampleSentence,
                HSKLevel = w.HSKLevel,
                StrokeCount = w.StrokeCount
            }).ToList(),
            
            // Grammar - Ngữ pháp (Sentence Patterns)
            SentencePatterns = lesson.SentencePatterns.Select(sp => new SentencePatternDto
            {
                Id = sp.Id,
                LessonId = sp.LessonId,
                PatternText = sp.PatternText,
                Pinyin = sp.Pinyin,
                Meaning = sp.Meaning,
                Usage = sp.Usage,
                ExampleSentences = sp.ExampleSentences,
                Category = sp.Category,
                DifficultyLevel = sp.DifficultyLevel
            }).ToList(),
            
            // Reading - Bài đọc
            ReadingPassages = lesson.ReadingPassages.Select(rp => new ReadingPassageDto
            {
                Id = rp.Id,
                LessonId = rp.LessonId,
                Title = rp.Title,
                PassageText = rp.PassageText,
                Pinyin = rp.Pinyin,
                Translation = rp.Translation,
                DifficultyLevel = rp.DifficultyLevel,
                WordCount = rp.WordCount,
                Category = rp.Category,
                ImageUrl = rp.ImageUrl,
                Questions = rp.Questions.Select(q => new QuestionDto
                {
                    Id = q.Id,
                    QuestionText = q.QuestionText,
                    QuestionType = q.QuestionType,
                    AudioUrl = q.AudioUrl,
                    Points = q.Points,
                    Explanation = q.Explanation,
                    Options = q.QuestionOptions.Select(o => new QuestionOptionDto
                    {
                        Id = o.Id,
                        OptionText = o.OptionText,
                        OptionLabel = o.OptionLabel,
                        IsCorrect = o.IsCorrect
                    }).ToList()
                }).ToList()
            }).ToList(),
            
            // Dialogues - Hội thoại
            Dialogues = lesson.Dialogues.Select(d => new DialogueDto
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
                Questions = d.Questions.Select(q => new QuestionDto
                {
                    Id = q.Id,
                    QuestionText = q.QuestionText,
                    QuestionType = q.QuestionType,
                    AudioUrl = q.AudioUrl,
                    Points = q.Points,
                    Explanation = q.Explanation,
                    Options = q.QuestionOptions.Select(o => new QuestionOptionDto
                    {
                        Id = o.Id,
                        OptionText = o.OptionText,
                        OptionLabel = o.OptionLabel,
                        IsCorrect = o.IsCorrect
                    }).ToList()
                }).ToList()
            }).ToList(),
            
            // Quiz - Câu hỏi tổng hợp
            Questions = lesson.Questions
                .Where(q => q.ReadingPassageId == null && q.DialogueId == null && q.SentencePatternId == null)
                .Select(q => new QuestionDto
                {
                    Id = q.Id,
                    QuestionText = q.QuestionText,
                    QuestionType = q.QuestionType,
                    AudioUrl = q.AudioUrl,
                    Points = q.Points,
                    Explanation = q.Explanation,
                    Options = q.QuestionOptions.Select(o => new QuestionOptionDto
                    {
                        Id = o.Id,
                        OptionText = o.OptionText,
                        OptionLabel = o.OptionLabel,
                        IsCorrect = o.IsCorrect // Không hiển thị đáp án cho user khi làm bài
                    }).ToList()
                }).ToList()
        };
    }

    public async Task<bool> CheckLessonUnlockStatusAsync(int lessonId, string userId)
    {
        var lesson = await _lessonRepository.GetLessonByIdAsync(lessonId);
        if (lesson == null)
            return false;

        // Nếu bài học không bị khóa trong database, cho phép truy cập
        if (!lesson.IsLocked)
            return false;

        // Kiểm tra prerequisite
        if (lesson.PrerequisiteLessonId.HasValue)
        {
            var prerequisiteCompleted = await _lessonRepository.IsPrerequisiteLessonCompletedAsync(
                userId, lesson.PrerequisiteLessonId.Value);

            return !prerequisiteCompleted; // Return true nếu bị khóa
        }

        // Bài học đầu tiên trong khóa học thì mở khóa
        if (lesson.LessonIndex == 1)
            return false;

        return true; // Các bài học khác mặc định bị khóa
    }

    public async Task<List<LessonListDto>> GetLessonsByHSKLevelAsync(int hskLevel, string userId)
    {
        var lessons = await _lessonRepository.GetLessonsByHSKLevelAsync(hskLevel);
        var result = new List<LessonListDto>();

        foreach (var lesson in lessons)
        {
            var isCompleted = await _lessonRepository.IsLessonCompletedAsync(userId, lesson.Id);
            var isLocked = await CheckLessonUnlockStatusAsync(lesson.Id, userId);

            // Load lesson details để đếm Words và Questions
            var lessonDetails = await _lessonRepository.GetLessonWithDetailsAsync(lesson.Id);

            result.Add(new LessonListDto
            {
                Id = lesson.Id,
                CourseId = lesson.CourseId,
                Title = lesson.Title,
                Description = lesson.Description,
                LessonIndex = lesson.LessonIndex,
                IsLocked = isLocked,
                IsCompleted = isCompleted,
                PrerequisiteLessonId = lesson.PrerequisiteLessonId,
                TotalWords = lessonDetails?.Words.Count ?? 0,
                TotalQuestions = lessonDetails?.Questions.Count ?? 0
            });
        }

        return result;
    }
}

