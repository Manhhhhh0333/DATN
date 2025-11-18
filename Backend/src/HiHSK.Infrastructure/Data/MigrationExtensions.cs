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

        // Seed CourseCategories (với IDENTITY_INSERT để đảm bảo Id đúng)
        foreach (var category in seedData.CourseCategories)
        {
            migrationBuilder.Sql($@"
                IF NOT EXISTS (SELECT 1 FROM CourseCategories WHERE Id = {category.Id})
                BEGIN
                    SET IDENTITY_INSERT [CourseCategories] ON;
                    INSERT INTO [CourseCategories] (Id, Name, DisplayName, Description, IconUrl, SortOrder)
                    VALUES ({category.Id}, 
                            N'{EscapeSql(category.Name)}', 
                            N'{EscapeSql(category.DisplayName ?? "")}', 
                            N'{EscapeSql(category.Description ?? "")}', 
                            {(category.IconUrl != null ? $"N'{EscapeSql(category.IconUrl)}'" : "NULL")}, 
                            {category.SortOrder});
                    SET IDENTITY_INSERT [CourseCategories] OFF;
                END
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

        // Seed Words - Sử dụng dynamic SQL để tránh SQL Server validate syntax khi cột TopicId chưa tồn tại
        foreach (var word in seedData.Words)
        {
            string charEscaped = EscapeSql(word.Character ?? "").Replace("'", "''");
            string pinyinEscaped = EscapeSql(word.Pinyin ?? "").Replace("'", "''");
            string meaningEscaped = EscapeSql(word.Meaning ?? "").Replace("'", "''");
            string audioUrlValue = word.AudioUrl != null ? $"N'{EscapeSql(word.AudioUrl).Replace("'", "''")}'" : "NULL";
            string exampleValue = word.ExampleSentence != null ? $"N'{EscapeSql(word.ExampleSentence).Replace("'", "''")}'" : "NULL";

            string insertWithTopicId = $"INSERT INTO Words (TopicId, Character, Pinyin, Meaning, AudioUrl, ExampleSentence, HSKLevel, Frequency, StrokeCount, CreatedAt) VALUES (NULL, N'{charEscaped}', N'{pinyinEscaped}', N'{meaningEscaped}', {audioUrlValue}, {exampleValue}, {word.HSKLevel ?? 1}, {word.Frequency ?? 50}, {word.StrokeCount ?? 7}, GETDATE())";
            string insertWithoutTopicId = $"INSERT INTO Words (Character, Pinyin, Meaning, AudioUrl, ExampleSentence, HSKLevel, Frequency, StrokeCount, CreatedAt) VALUES (N'{charEscaped}', N'{pinyinEscaped}', N'{meaningEscaped}', {audioUrlValue}, {exampleValue}, {word.HSKLevel ?? 1}, {word.Frequency ?? 50}, {word.StrokeCount ?? 7}, GETDATE())";

            string insertWithTopicIdEscaped = insertWithTopicId.Replace("'", "''");
            string insertWithoutTopicIdEscaped = insertWithoutTopicId.Replace("'", "''");

            migrationBuilder.Sql($@"
                IF NOT EXISTS (SELECT 1 FROM Words WHERE Character = N'{EscapeSql(word.Character ?? "")}' AND Pinyin = N'{EscapeSql(word.Pinyin ?? "")}')
                BEGIN
                    DECLARE @sql NVARCHAR(MAX);
                    IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Words' AND COLUMN_NAME = 'TopicId')
                    BEGIN
                        SET @sql = N'{insertWithTopicIdEscaped}';
                        EXEC sp_executesql @sql;
                    END
                    ELSE
                    BEGIN
                        SET @sql = N'{insertWithoutTopicIdEscaped}';
                        EXEC sp_executesql @sql;
                    END
                END
            ");
        }

        // Seed VocabularyTopic cho HSK1 (Id=1)
        migrationBuilder.Sql(@"
            IF NOT EXISTS (SELECT 1 FROM VocabularyTopics WHERE Id = 1)
            BEGIN
                SET IDENTITY_INSERT [VocabularyTopics] ON;
                INSERT INTO [VocabularyTopics] (Id, Name, Description, ImageUrl, SortOrder)
                VALUES (1, N'HSK 1', N'Từ vựng HSK Cấp độ 1 - 150 từ vựng cơ bản', NULL, 1);
                SET IDENTITY_INSERT [VocabularyTopics] OFF;
            END
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

