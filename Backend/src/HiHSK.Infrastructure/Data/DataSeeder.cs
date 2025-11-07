using HiHSK.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace HiHSK.Infrastructure.Data;

public class SeedData
{
    public List<CourseCategory> CourseCategories { get; set; } = new();
    public List<Course> Courses { get; set; } = new();
    public List<Lesson> Lessons { get; set; } = new();
    public List<Word> Words { get; set; } = new();
    public List<QuestionSeedData> Questions { get; set; } = new();
}

public class DataSeeder
{
    private readonly ApplicationDbContext _context;

    public DataSeeder(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task SeedFromJsonAsync(string jsonFilePath)
    {
        if (!File.Exists(jsonFilePath))
        {
            throw new FileNotFoundException($"Seed data file not found: {jsonFilePath}");
        }

        var json = await File.ReadAllTextAsync(jsonFilePath);
        var seedData = JsonSerializer.Deserialize<SeedData>(json, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        if (seedData == null)
        {
            throw new InvalidOperationException("Failed to deserialize seed data");
        }

        // Clear existing data (optional - use with caution!)
        // await ClearDataAsync();

        // Seed CourseCategories
        if (!await _context.CourseCategories.AnyAsync())
        {
            foreach (var category in seedData.CourseCategories)
            {
                category.Id = 0; // Let database generate ID
            }
            await _context.CourseCategories.AddRangeAsync(seedData.CourseCategories);
            await _context.SaveChangesAsync();
        }

        // Seed Courses
        if (!await _context.Courses.AnyAsync())
        {
            foreach (var course in seedData.Courses)
            {
                course.Id = 0; // Let database generate ID
            }
            await _context.Courses.AddRangeAsync(seedData.Courses);
            await _context.SaveChangesAsync();
        }

        // Seed Lessons
        if (!await _context.Lessons.AnyAsync())
        {
            // Dictionary để map lessonIndex -> lessonId (sau khi seed)
            var lessonIndexToIdMap = new Dictionary<int, int>();
            
            foreach (var lesson in seedData.Lessons)
            {
                var lessonIndex = lesson.LessonIndex;
                lesson.Id = 0; // Let database generate ID
            }
            await _context.Lessons.AddRangeAsync(seedData.Lessons);
            await _context.SaveChangesAsync();
            
            // Map lessonIndex -> lessonId
            foreach (var lesson in seedData.Lessons)
            {
                lessonIndexToIdMap[lesson.LessonIndex] = lesson.Id;
            }
            
            // Seed Words - Map lessonId từ lessonIndex sang ID thực tế
            if (!await _context.Words.AnyAsync())
            {
                foreach (var word in seedData.Words)
                {
                    word.Id = 0; // Let database generate ID
                    
                    // Map lessonId từ lessonIndex (trong JSON) sang ID thực tế
                    if (word.LessonId.HasValue && lessonIndexToIdMap.ContainsKey(word.LessonId.Value))
                    {
                        word.LessonId = lessonIndexToIdMap[word.LessonId.Value];
                    }
                }
                await _context.Words.AddRangeAsync(seedData.Words);
                await _context.SaveChangesAsync();
            }
        }
        else
        {
            // Nếu đã có lessons, chỉ seed words nếu chưa có
            if (!await _context.Words.AnyAsync())
            {
                // Lấy mapping lessonIndex -> lessonId từ database
                var lessonIndexToIdMap = await _context.Lessons
                    .ToDictionaryAsync(l => l.LessonIndex, l => l.Id);
                
                foreach (var word in seedData.Words)
                {
                    word.Id = 0; // Let database generate ID
                    
                    // Map lessonId từ lessonIndex (trong JSON) sang ID thực tế
                    if (word.LessonId.HasValue && lessonIndexToIdMap.ContainsKey(word.LessonId.Value))
                    {
                        word.LessonId = lessonIndexToIdMap[word.LessonId.Value];
                    }
                }
                await _context.Words.AddRangeAsync(seedData.Words);
                await _context.SaveChangesAsync();
            }
        }

        // Seed Questions with Options
        if (!await _context.Questions.AnyAsync())
        {
            // First, save questions to get IDs
            var questionsToAdd = new List<Question>();
            foreach (var questionData in seedData.Questions)
            {
                var question = new Question
                {
                    LessonId = questionData.LessonId,
                    QuestionText = questionData.QuestionText,
                    QuestionType = questionData.QuestionType,
                    AudioUrl = questionData.AudioUrl,
                    Points = questionData.Points,
                    DifficultyLevel = questionData.DifficultyLevel,
                    Explanation = questionData.Explanation,
                };
                questionsToAdd.Add(question);
            }
            
            await _context.Questions.AddRangeAsync(questionsToAdd);
            await _context.SaveChangesAsync();

            // Now add question options
            var optionsToAdd = new List<QuestionOption>();
            for (int i = 0; i < seedData.Questions.Count; i++)
            {
                var questionData = seedData.Questions[i];
                var savedQuestion = questionsToAdd[i];
                
                foreach (var optionData in questionData.Options)
                {
                    optionsToAdd.Add(new QuestionOption
                    {
                        QuestionId = savedQuestion.Id,
                        OptionLabel = optionData.OptionLabel,
                        OptionText = optionData.OptionText,
                        IsCorrect = optionData.IsCorrect,
                        Explanation = optionData.Explanation
                    });
                }
            }
            
            await _context.QuestionOptions.AddRangeAsync(optionsToAdd);
            await _context.SaveChangesAsync();
        }
    }

    // Optional: Clear all seed data (use with caution!)
    private async Task ClearDataAsync()
    {
        _context.QuestionOptions.RemoveRange(_context.QuestionOptions);
        _context.Questions.RemoveRange(_context.Questions);
        _context.Words.RemoveRange(_context.Words);
        _context.Lessons.RemoveRange(_context.Lessons);
        _context.Courses.RemoveRange(_context.Courses);
        _context.CourseCategories.RemoveRange(_context.CourseCategories);
        await _context.SaveChangesAsync();
    }
}

// Helper classes for JSON deserialization
public class QuestionSeedData
{
    public int? LessonId { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string QuestionType { get; set; } = "CHOOSE_MEANING";
    public string? AudioUrl { get; set; }
    public int Points { get; set; } = 1;
    public int DifficultyLevel { get; set; } = 1;
    public string? Explanation { get; set; }
    public List<QuestionOptionSeedData> Options { get; set; } = new();
}

public class QuestionOptionSeedData
{
    public string OptionLabel { get; set; } = string.Empty;
    public string OptionText { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public string? Explanation { get; set; }
}

