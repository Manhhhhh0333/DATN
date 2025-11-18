using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HiHSK.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddLessonTopicAndExercise : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Tạo bảng LessonTopics
            migrationBuilder.CreateTable(
                name: "LessonTopics",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CourseId = table.Column<int>(type: "int", nullable: true),
                    HSKLevel = table.Column<int>(type: "int", nullable: true),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    TopicIndex = table.Column<int>(type: "int", nullable: false),
                    IsLocked = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    PrerequisiteTopicId = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LessonTopics", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LessonTopics_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_LessonTopics_LessonTopics_PrerequisiteTopicId",
                        column: x => x.PrerequisiteTopicId,
                        principalTable: "LessonTopics",
                        principalColumn: "Id");
                });

            // Tạo bảng LessonExercises
            migrationBuilder.CreateTable(
                name: "LessonExercises",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TopicId = table.Column<int>(type: "int", nullable: false),
                    ExerciseType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ExerciseIndex = table.Column<int>(type: "int", nullable: false),
                    IsLocked = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    PrerequisiteExerciseId = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LessonExercises", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LessonExercises_LessonTopics_TopicId",
                        column: x => x.TopicId,
                        principalTable: "LessonTopics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LessonExercises_LessonExercises_PrerequisiteExerciseId",
                        column: x => x.PrerequisiteExerciseId,
                        principalTable: "LessonExercises",
                        principalColumn: "Id");
                });

            // Thêm cột TopicId vào bảng Words
            migrationBuilder.AddColumn<int>(
                name: "TopicId",
                table: "Words",
                type: "int",
                nullable: true);

            // Thêm cột ExerciseId vào các bảng liên quan
            migrationBuilder.AddColumn<int>(
                name: "ExerciseId",
                table: "Questions",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ExerciseId",
                table: "Dialogues",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ExerciseId",
                table: "ReadingPassages",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ExerciseId",
                table: "SentencePatterns",
                type: "int",
                nullable: true);

            // Tạo indexes
            migrationBuilder.CreateIndex(
                name: "IX_LessonTopics_CourseId",
                table: "LessonTopics",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_LessonTopics_HSKLevel_TopicIndex",
                table: "LessonTopics",
                columns: new[] { "HSKLevel", "TopicIndex" });

            migrationBuilder.CreateIndex(
                name: "IX_LessonTopics_PrerequisiteTopicId",
                table: "LessonTopics",
                column: "PrerequisiteTopicId");

            migrationBuilder.CreateIndex(
                name: "IX_LessonExercises_TopicId_ExerciseIndex",
                table: "LessonExercises",
                columns: new[] { "TopicId", "ExerciseIndex" });

            migrationBuilder.CreateIndex(
                name: "IX_LessonExercises_PrerequisiteExerciseId",
                table: "LessonExercises",
                column: "PrerequisiteExerciseId");

            migrationBuilder.CreateIndex(
                name: "IX_Words_TopicId",
                table: "Words",
                column: "TopicId");

            migrationBuilder.CreateIndex(
                name: "IX_Questions_ExerciseId",
                table: "Questions",
                column: "ExerciseId");

            migrationBuilder.CreateIndex(
                name: "IX_Dialogues_ExerciseId",
                table: "Dialogues",
                column: "ExerciseId");

            migrationBuilder.CreateIndex(
                name: "IX_ReadingPassages_ExerciseId",
                table: "ReadingPassages",
                column: "ExerciseId");

            migrationBuilder.CreateIndex(
                name: "IX_SentencePatterns_ExerciseId",
                table: "SentencePatterns",
                column: "ExerciseId");

            // Tạo foreign keys
            migrationBuilder.AddForeignKey(
                name: "FK_Words_LessonTopics_TopicId",
                table: "Words",
                column: "TopicId",
                principalTable: "LessonTopics",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Questions_LessonExercises_ExerciseId",
                table: "Questions",
                column: "ExerciseId",
                principalTable: "LessonExercises",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Dialogues_LessonExercises_ExerciseId",
                table: "Dialogues",
                column: "ExerciseId",
                principalTable: "LessonExercises",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_ReadingPassages_LessonExercises_ExerciseId",
                table: "ReadingPassages",
                column: "ExerciseId",
                principalTable: "LessonExercises",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_SentencePatterns_LessonExercises_ExerciseId",
                table: "SentencePatterns",
                column: "ExerciseId",
                principalTable: "LessonExercises",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Xóa foreign keys (kiểm tra tồn tại trước khi drop)
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_SentencePatterns_LessonExercises_ExerciseId')
                    ALTER TABLE [SentencePatterns] DROP CONSTRAINT [FK_SentencePatterns_LessonExercises_ExerciseId];
            ");

            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_ReadingPassages_LessonExercises_ExerciseId')
                    ALTER TABLE [ReadingPassages] DROP CONSTRAINT [FK_ReadingPassages_LessonExercises_ExerciseId];
            ");

            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Dialogues_LessonExercises_ExerciseId')
                    ALTER TABLE [Dialogues] DROP CONSTRAINT [FK_Dialogues_LessonExercises_ExerciseId];
            ");

            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Questions_LessonExercises_ExerciseId')
                    ALTER TABLE [Questions] DROP CONSTRAINT [FK_Questions_LessonExercises_ExerciseId];
            ");

            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Words_LessonTopics_TopicId')
                    ALTER TABLE [Words] DROP CONSTRAINT [FK_Words_LessonTopics_TopicId];
            ");

            // Xóa indexes (kiểm tra tồn tại trước khi drop)
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_SentencePatterns_ExerciseId' AND object_id = OBJECT_ID('SentencePatterns'))
                    DROP INDEX [IX_SentencePatterns_ExerciseId] ON [SentencePatterns];
            ");

            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ReadingPassages_ExerciseId' AND object_id = OBJECT_ID('ReadingPassages'))
                    DROP INDEX [IX_ReadingPassages_ExerciseId] ON [ReadingPassages];
            ");

            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Dialogues_ExerciseId' AND object_id = OBJECT_ID('Dialogues'))
                    DROP INDEX [IX_Dialogues_ExerciseId] ON [Dialogues];
            ");

            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Questions_ExerciseId' AND object_id = OBJECT_ID('Questions'))
                    DROP INDEX [IX_Questions_ExerciseId] ON [Questions];
            ");

            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Words_TopicId' AND object_id = OBJECT_ID('Words'))
                    DROP INDEX [IX_Words_TopicId] ON [Words];
            ");

            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_LessonExercises_PrerequisiteExerciseId' AND object_id = OBJECT_ID('LessonExercises'))
                    DROP INDEX [IX_LessonExercises_PrerequisiteExerciseId] ON [LessonExercises];
            ");

            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_LessonExercises_TopicId_ExerciseIndex' AND object_id = OBJECT_ID('LessonExercises'))
                    DROP INDEX [IX_LessonExercises_TopicId_ExerciseIndex] ON [LessonExercises];
            ");

            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_LessonTopics_PrerequisiteTopicId' AND object_id = OBJECT_ID('LessonTopics'))
                    DROP INDEX [IX_LessonTopics_PrerequisiteTopicId] ON [LessonTopics];
            ");

            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_LessonTopics_HSKLevel_TopicIndex' AND object_id = OBJECT_ID('LessonTopics'))
                    DROP INDEX [IX_LessonTopics_HSKLevel_TopicIndex] ON [LessonTopics];
            ");

            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_LessonTopics_CourseId' AND object_id = OBJECT_ID('LessonTopics'))
                    DROP INDEX [IX_LessonTopics_CourseId] ON [LessonTopics];
            ");

            // Xóa cột (kiểm tra tồn tại trước khi drop)
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SentencePatterns' AND COLUMN_NAME = 'ExerciseId')
                    ALTER TABLE [SentencePatterns] DROP COLUMN [ExerciseId];
            ");

            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'ReadingPassages' AND COLUMN_NAME = 'ExerciseId')
                    ALTER TABLE [ReadingPassages] DROP COLUMN [ExerciseId];
            ");

            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Dialogues' AND COLUMN_NAME = 'ExerciseId')
                    ALTER TABLE [Dialogues] DROP COLUMN [ExerciseId];
            ");

            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Questions' AND COLUMN_NAME = 'ExerciseId')
                    ALTER TABLE [Questions] DROP COLUMN [ExerciseId];
            ");

            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Words' AND COLUMN_NAME = 'TopicId')
                    ALTER TABLE [Words] DROP COLUMN [TopicId];
            ");

            // Xóa bảng (kiểm tra tồn tại trước khi drop)
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'LessonExercises')
                    DROP TABLE [LessonExercises];
            ");

            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'LessonTopics')
                    DROP TABLE [LessonTopics];
            ");
        }
    }
}
