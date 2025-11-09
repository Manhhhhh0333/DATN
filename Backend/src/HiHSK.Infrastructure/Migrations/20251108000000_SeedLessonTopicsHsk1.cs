using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HiHSK.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedLessonTopicsHsk1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Seed LessonTopics cho HSK1
            // Chủ đề 1: Chào hỏi và Gia đình
            migrationBuilder.Sql(@"
                SET IDENTITY_INSERT LessonTopics ON;
                IF NOT EXISTS (SELECT 1 FROM LessonTopics WHERE Id = 1)
                INSERT INTO LessonTopics (Id, CourseId, HSKLevel, Title, Description, ImageUrl, TopicIndex, IsLocked, PrerequisiteTopicId, CreatedAt, IsActive)
                VALUES (1, 1, 1, N'Chào hỏi và Gia đình', N'Học cách chào hỏi và các từ vựng về gia đình', NULL, 1, 0, NULL, GETDATE(), 1);
                SET IDENTITY_INSERT LessonTopics OFF;
            ");

            // Chủ đề 2: Số đếm và Thời gian
            migrationBuilder.Sql(@"
                SET IDENTITY_INSERT LessonTopics ON;
                IF NOT EXISTS (SELECT 1 FROM LessonTopics WHERE Id = 2)
                INSERT INTO LessonTopics (Id, CourseId, HSKLevel, Title, Description, ImageUrl, TopicIndex, IsLocked, PrerequisiteTopicId, CreatedAt, IsActive)
                VALUES (2, 1, 1, N'Số đếm và Thời gian', N'Học số đếm và cách nói về thời gian', NULL, 2, 0, 1, GETDATE(), 1);
                SET IDENTITY_INSERT LessonTopics OFF;
            ");

            // Chủ đề 3: Màu sắc và Đồ vật
            migrationBuilder.Sql(@"
                SET IDENTITY_INSERT LessonTopics ON;
                IF NOT EXISTS (SELECT 1 FROM LessonTopics WHERE Id = 3)
                INSERT INTO LessonTopics (Id, CourseId, HSKLevel, Title, Description, ImageUrl, TopicIndex, IsLocked, PrerequisiteTopicId, CreatedAt, IsActive)
                VALUES (3, 1, 1, N'Màu sắc và Đồ vật', N'Học từ vựng về màu sắc và các đồ vật thường dùng', NULL, 3, 0, 2, GETDATE(), 1);
                SET IDENTITY_INSERT LessonTopics OFF;
            ");

            // Chủ đề 4: Thực phẩm và Ăn uống
            migrationBuilder.Sql(@"
                SET IDENTITY_INSERT LessonTopics ON;
                IF NOT EXISTS (SELECT 1 FROM LessonTopics WHERE Id = 4)
                INSERT INTO LessonTopics (Id, CourseId, HSKLevel, Title, Description, ImageUrl, TopicIndex, IsLocked, PrerequisiteTopicId, CreatedAt, IsActive)
                VALUES (4, 1, 1, N'Thực phẩm và Ăn uống', N'Học từ vựng về đồ ăn, thức uống và các hoạt động ăn uống', NULL, 4, 0, 3, GETDATE(), 1);
                SET IDENTITY_INSERT LessonTopics OFF;
            ");

            // Chủ đề 5: Giao thông và Địa điểm
            migrationBuilder.Sql(@"
                SET IDENTITY_INSERT LessonTopics ON;
                IF NOT EXISTS (SELECT 1 FROM LessonTopics WHERE Id = 5)
                INSERT INTO LessonTopics (Id, CourseId, HSKLevel, Title, Description, ImageUrl, TopicIndex, IsLocked, PrerequisiteTopicId, CreatedAt, IsActive)
                VALUES (5, 1, 1, N'Giao thông và Địa điểm', N'Học từ vựng về phương tiện giao thông và các địa điểm', NULL, 5, 0, 4, GETDATE(), 1);
                SET IDENTITY_INSERT LessonTopics OFF;
            ");

            // Chủ đề 6: Học tập và Công việc
            migrationBuilder.Sql(@"
                SET IDENTITY_INSERT LessonTopics ON;
                IF NOT EXISTS (SELECT 1 FROM LessonTopics WHERE Id = 6)
                INSERT INTO LessonTopics (Id, CourseId, HSKLevel, Title, Description, ImageUrl, TopicIndex, IsLocked, PrerequisiteTopicId, CreatedAt, IsActive)
                VALUES (6, 1, 1, N'Học tập và Công việc', N'Học từ vựng về học tập, công việc và các hoạt động hàng ngày', NULL, 6, 0, 5, GETDATE(), 1);
                SET IDENTITY_INSERT LessonTopics OFF;
            ");

            // Chủ đề 7: Cảm xúc và Tính từ
            migrationBuilder.Sql(@"
                SET IDENTITY_INSERT LessonTopics ON;
                IF NOT EXISTS (SELECT 1 FROM LessonTopics WHERE Id = 7)
                INSERT INTO LessonTopics (Id, CourseId, HSKLevel, Title, Description, ImageUrl, TopicIndex, IsLocked, PrerequisiteTopicId, CreatedAt, IsActive)
                VALUES (7, 1, 1, N'Cảm xúc và Tính từ', N'Học các từ vựng mô tả cảm xúc và tính từ cơ bản', NULL, 7, 0, 6, GETDATE(), 1);
                SET IDENTITY_INSERT LessonTopics OFF;
            ");

            // Chủ đề 8: Động từ hành động
            migrationBuilder.Sql(@"
                SET IDENTITY_INSERT LessonTopics ON;
                IF NOT EXISTS (SELECT 1 FROM LessonTopics WHERE Id = 8)
                INSERT INTO LessonTopics (Id, CourseId, HSKLevel, Title, Description, ImageUrl, TopicIndex, IsLocked, PrerequisiteTopicId, CreatedAt, IsActive)
                VALUES (8, 1, 1, N'Động từ hành động', N'Học các động từ cơ bản trong giao tiếp hàng ngày', NULL, 8, 0, 7, GETDATE(), 1);
                SET IDENTITY_INSERT LessonTopics OFF;
            ");

            // Chủ đề 9: Ngữ pháp cơ bản
            migrationBuilder.Sql(@"
                SET IDENTITY_INSERT LessonTopics ON;
                IF NOT EXISTS (SELECT 1 FROM LessonTopics WHERE Id = 9)
                INSERT INTO LessonTopics (Id, CourseId, HSKLevel, Title, Description, ImageUrl, TopicIndex, IsLocked, PrerequisiteTopicId, CreatedAt, IsActive)
                VALUES (9, 1, 1, N'Ngữ pháp cơ bản', N'Học các cấu trúc ngữ pháp và mẫu câu cơ bản', NULL, 9, 0, 8, GETDATE(), 1);
                SET IDENTITY_INSERT LessonTopics OFF;
            ");

            // Chủ đề 10: Tổng hợp và Ôn tập
            migrationBuilder.Sql(@"
                SET IDENTITY_INSERT LessonTopics ON;
                IF NOT EXISTS (SELECT 1 FROM LessonTopics WHERE Id = 10)
                INSERT INTO LessonTopics (Id, CourseId, HSKLevel, Title, Description, ImageUrl, TopicIndex, IsLocked, PrerequisiteTopicId, CreatedAt, IsActive)
                VALUES (10, 1, 1, N'Tổng hợp và Ôn tập', N'Ôn tập lại tất cả từ vựng và ngữ pháp đã học', NULL, 10, 0, 9, GETDATE(), 1);
                SET IDENTITY_INSERT LessonTopics OFF;
            ");

            // Gán các từ vựng HSK1 vào các topics tương ứng
            // Chủ đề 1: Chào hỏi và Gia đình (từ vựng từ lesson 1-2)
            migrationBuilder.Sql(@"
                UPDATE Words 
                SET TopicId = 1 
                WHERE HSKLevel = 1 AND LessonId IN (1, 2)
                AND TopicId IS NULL;
            ");

            // Chủ đề 2: Số đếm và Thời gian (từ vựng từ lesson 3-4)
            migrationBuilder.Sql(@"
                UPDATE Words 
                SET TopicId = 2 
                WHERE HSKLevel = 1 AND LessonId IN (3, 4)
                AND TopicId IS NULL;
            ");

            // Chủ đề 3: Màu sắc và Đồ vật (từ vựng từ lesson 5-6)
            migrationBuilder.Sql(@"
                UPDATE Words 
                SET TopicId = 3 
                WHERE HSKLevel = 1 AND LessonId IN (5, 6)
                AND TopicId IS NULL;
            ");

            // Chủ đề 4: Thực phẩm và Ăn uống (từ vựng từ lesson 7-8)
            migrationBuilder.Sql(@"
                UPDATE Words 
                SET TopicId = 4 
                WHERE HSKLevel = 1 AND LessonId IN (7, 8)
                AND TopicId IS NULL;
            ");

            // Chủ đề 5: Giao thông và Địa điểm (từ vựng từ lesson 9-10)
            migrationBuilder.Sql(@"
                UPDATE Words 
                SET TopicId = 5 
                WHERE HSKLevel = 1 AND LessonId IN (9, 10)
                AND TopicId IS NULL;
            ");

            // Chủ đề 6: Học tập và Công việc (từ vựng từ lesson 11)
            migrationBuilder.Sql(@"
                UPDATE Words 
                SET TopicId = 6 
                WHERE HSKLevel = 1 AND LessonId = 11
                AND TopicId IS NULL;
            ");

            // Chủ đề 7: Cảm xúc và Tính từ (từ vựng từ lesson 12)
            migrationBuilder.Sql(@"
                UPDATE Words 
                SET TopicId = 7 
                WHERE HSKLevel = 1 AND LessonId = 12
                AND TopicId IS NULL;
            ");

            // Chủ đề 8: Động từ hành động (từ vựng từ lesson 13)
            migrationBuilder.Sql(@"
                UPDATE Words 
                SET TopicId = 8 
                WHERE HSKLevel = 1 AND LessonId = 13
                AND TopicId IS NULL;
            ");

            // Chủ đề 9 và 10: Gán các từ còn lại
            migrationBuilder.Sql(@"
                UPDATE Words 
                SET TopicId = 9 
                WHERE HSKLevel = 1 AND TopicId IS NULL AND LessonId IS NULL;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Xóa các từ vựng khỏi topics
            migrationBuilder.Sql("UPDATE Words SET TopicId = NULL WHERE HSKLevel = 1");

            // Xóa các topics
            migrationBuilder.Sql("DELETE FROM LessonTopics WHERE HSKLevel = 1");
        }
    }
}

