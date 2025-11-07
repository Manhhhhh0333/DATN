using HiHSK.Infrastructure.Data;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HiHSK.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedHSK1Data : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Tìm đường dẫn file JSON seed data
            var jsonPath = FindSeedDataFile();

            if (string.IsNullOrEmpty(jsonPath))
            {
                // Nếu không tìm thấy file, bỏ qua seed data
                return;
            }

            // Sử dụng extension method để seed data
            migrationBuilder.SeedDataFromJson(jsonPath);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Xóa dữ liệu seed (tùy chọn)
            migrationBuilder.Sql("DELETE FROM WordVocabularyTopics WHERE VocabularyTopicId = 1");
            migrationBuilder.Sql("DELETE FROM VocabularyTopics WHERE Id = 1");
            migrationBuilder.Sql("DELETE FROM Words WHERE HSKLevel = 1");
            migrationBuilder.Sql("DELETE FROM Lessons WHERE CourseId = 1");
            migrationBuilder.Sql("DELETE FROM Courses WHERE CategoryId = 1");
            migrationBuilder.Sql("DELETE FROM CourseCategories WHERE Name = 'HSK1'");
        }

        /// <summary>
        /// Tìm file seed data JSON
        /// </summary>
#nullable enable
        private string? FindSeedDataFile()
#nullable disable
        {
            var possiblePaths = new[]
            {
                Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "..", "..", "data", "seed-data-hsk1.json"),
                Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "..", "..", "..", "data", "seed-data-hsk1.json"),
                Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "..", "..", "data", "seed-data-hsk1.json"),
            };

            foreach (var path in possiblePaths)
            {
                var fullPath = Path.GetFullPath(path);
                if (System.IO.File.Exists(fullPath))
                {
                    return fullPath;
                }
            }

            return null;
        }
    }
}
