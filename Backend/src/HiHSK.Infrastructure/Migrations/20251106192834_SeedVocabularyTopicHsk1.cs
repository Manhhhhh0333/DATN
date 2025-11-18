using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HiHSK.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedVocabularyTopicHsk1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Seed VocabularyTopic cho HSK1 (Id=1)
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM VocabularyTopics WHERE Id = 1)
                BEGIN
                    SET IDENTITY_INSERT [VocabularyTopics] ON;
                END
            ");
            
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM VocabularyTopics WHERE Id = 1)
                BEGIN
                    INSERT INTO [VocabularyTopics] (Id, Name, Description, ImageUrl, SortOrder)
                    VALUES (1, N'HSK 1', N'Từ vựng HSK Cấp độ 1 - 150 từ vựng cơ bản', NULL, 1);
                END
            ");
            
            migrationBuilder.Sql(@"
                SET IDENTITY_INSERT [VocabularyTopics] OFF;
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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Xóa dữ liệu seed vocabulary topic
            migrationBuilder.Sql("DELETE FROM WordVocabularyTopics WHERE VocabularyTopicId = 1");
            migrationBuilder.Sql("DELETE FROM VocabularyTopics WHERE Id = 1");
        }
    }
}
