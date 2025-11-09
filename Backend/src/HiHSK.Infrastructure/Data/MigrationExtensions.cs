using Microsoft.EntityFrameworkCore.Migrations;
using System.Text.Json;

namespace HiHSK.Infrastructure.Data;

/// <summary>
/// Extension methods để seed data trong migrations
/// </summary>
public static class MigrationExtensions
{
    /// <summary>
    /// Seed data từ file JSON trong migration
    /// </summary>
    public static void SeedDataFromJson(this MigrationBuilder migrationBuilder, string jsonFilePath)
    {
        if (!System.IO.File.Exists(jsonFilePath))
        {
            // Nếu không tìm thấy file, bỏ qua
            return;
        }

        var json = System.IO.File.ReadAllText(jsonFilePath);
        var seedData = JsonSerializer.Deserialize<SeedData>(json, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        if (seedData == null)
        {
            return;
        }

        // Seed CourseCategories
        foreach (var category in seedData.CourseCategories)
        {
            migrationBuilder.Sql($@"
                IF NOT EXISTS (SELECT 1 FROM CourseCategories WHERE Name = '{EscapeSql(category.Name)}')
                INSERT INTO CourseCategories (Name, DisplayName, Description, IconUrl, SortOrder)
                VALUES ('{EscapeSql(category.Name)}', 
                        N'{EscapeSql(category.DisplayName ?? "")}', 
                        N'{EscapeSql(category.Description ?? "")}', 
                        {(category.IconUrl != null ? $"N'{EscapeSql(category.IconUrl)}'" : "NULL")}, 
                        {category.SortOrder})
            ");
        }

        // Seed Courses
        foreach (var course in seedData.Courses)
        {
            migrationBuilder.Sql($@"
                IF NOT EXISTS (SELECT 1 FROM Courses WHERE Title = N'{EscapeSql(course.Title ?? "")}')
                INSERT INTO Courses (CategoryId, Title, Description, ImageUrl, Level, HSKLevel, SortOrder, IsActive, CreatedAt)
                VALUES ({course.CategoryId}, 
                        N'{EscapeSql(course.Title ?? "")}', 
                        N'{EscapeSql(course.Description ?? "")}', 
                        {(course.ImageUrl != null ? $"N'{EscapeSql(course.ImageUrl)}'" : "NULL")}, 
                        N'{EscapeSql(course.Level ?? "")}', 
                        {course.HSKLevel}, 
                        {course.SortOrder}, 
                        {(course.IsActive ? 1 : 0)},
                        GETDATE())
            ");
        }

        // Seed Lessons (chỉ nếu có trong JSON)
        if (seedData.Lessons != null && seedData.Lessons.Count > 0)
        {
            foreach (var lesson in seedData.Lessons)
            {
                migrationBuilder.Sql($@"
                    IF NOT EXISTS (SELECT 1 FROM Lessons WHERE LessonIndex = {lesson.LessonIndex} AND CourseId = {lesson.CourseId})
                    INSERT INTO Lessons (CourseId, Title, Description, LessonIndex, Content, IsLocked, PrerequisiteLessonId, IsActive, CreatedAt)
                    VALUES ({lesson.CourseId}, 
                            N'{EscapeSql(lesson.Title ?? "")}', 
                            N'{EscapeSql(lesson.Description ?? "")}', 
                            {lesson.LessonIndex}, 
                            N'{EscapeSql(lesson.Content ?? "")}', 
                            {(lesson.IsLocked ? 1 : 0)}, 
                            {(lesson.PrerequisiteLessonId.HasValue ? lesson.PrerequisiteLessonId.Value.ToString() : "NULL")}, 
                            {(lesson.IsActive ? 1 : 0)}, 
                            GETDATE())
                ");
            }
        }

        // Seed Words - Map lessonId từ lessonIndex (nếu có lessons) hoặc NULL nếu không có
        foreach (var word in seedData.Words)
        {
            string lessonIdSql;
            if (word.LessonId.HasValue && seedData.Lessons != null && seedData.Lessons.Count > 0)
            {
                // Có lessonId và có lessons trong JSON - map từ lessonIndex
                lessonIdSql = $"(SELECT Id FROM Lessons WHERE LessonIndex = {word.LessonId.Value} AND CourseId = 1)";
            }
            else
            {
                // Không có lessonId hoặc không có lessons - set NULL
                lessonIdSql = "NULL";
            }

            migrationBuilder.Sql($@"
                IF NOT EXISTS (SELECT 1 FROM Words WHERE Character = N'{EscapeSql(word.Character ?? "")}' AND Pinyin = N'{EscapeSql(word.Pinyin ?? "")}')
                INSERT INTO Words (LessonId, Character, Pinyin, Meaning, AudioUrl, ExampleSentence, HSKLevel, Frequency, StrokeCount, CreatedAt)
                VALUES ({lessonIdSql}, 
                        N'{EscapeSql(word.Character ?? "")}', 
                        N'{EscapeSql(word.Pinyin ?? "")}', 
                        N'{EscapeSql(word.Meaning ?? "")}', 
                        {(word.AudioUrl != null ? $"N'{EscapeSql(word.AudioUrl)}'" : "NULL")}, 
                        {(word.ExampleSentence != null ? $"N'{EscapeSql(word.ExampleSentence)}'" : "NULL")}, 
                        {word.HSKLevel ?? 1}, 
                        {word.Frequency ?? 50}, 
                        {word.StrokeCount ?? 7}, 
                        GETDATE())
            ");
        }

        // Seed VocabularyTopic cho HSK1 (Id=1)
        migrationBuilder.Sql(@"
            IF NOT EXISTS (SELECT 1 FROM VocabularyTopics WHERE Id = 1)
            INSERT INTO VocabularyTopics (Id, Name, Description, ImageUrl, SortOrder)
            VALUES (1, N'HSK 1', N'Từ vựng HSK Cấp độ 1 - 150 từ vựng cơ bản', NULL, 1)
        ");

        // Seed WordVocabularyTopics - Gán tất cả từ vựng HSK1 vào Vocabulary Topic HSK1
        migrationBuilder.Sql(@"
            INSERT INTO WordVocabularyTopics (WordId, VocabularyTopicId)
            SELECT w.Id, 1
            FROM Words w
            WHERE w.HSKLevel = 1
            AND NOT EXISTS (
                SELECT 1 FROM WordVocabularyTopics wvt 
                WHERE wvt.WordId = w.Id AND wvt.VocabularyTopicId = 1
            )
        ");
    }

    /// <summary>
    /// Escape SQL string để tránh SQL injection
    /// </summary>
    private static string EscapeSql(string input)
    {
        if (string.IsNullOrEmpty(input))
            return string.Empty;

        return input.Replace("'", "''").Replace("\r", "").Replace("\n", " ");
    }
}

