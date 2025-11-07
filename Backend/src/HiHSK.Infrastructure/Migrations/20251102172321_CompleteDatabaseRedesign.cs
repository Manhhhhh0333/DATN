using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HiHSK.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CompleteDatabaseRedesign : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Questions_Lessons_LessonId",
                table: "Questions");

            migrationBuilder.DropForeignKey(
                name: "FK_Words_Lessons_LessonId",
                table: "Words");

            migrationBuilder.DropIndex(
                name: "IX_Lessons_CourseId",
                table: "Lessons");

            migrationBuilder.AlterColumn<int>(
                name: "LessonId",
                table: "Words",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Words",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GETDATE()");

            migrationBuilder.AddColumn<int>(
                name: "Frequency",
                table: "Words",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "HSKLevel",
                table: "Words",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "StrokeCount",
                table: "Words",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CorrectCount",
                table: "UserWordProgresses",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastReviewedAt",
                table: "UserWordProgresses",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ReviewCount",
                table: "UserWordProgresses",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "WrongCount",
                table: "UserWordProgresses",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<int>(
                name: "LessonId",
                table: "UserLessonProgresses",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<int>(
                name: "CorrectAnswers",
                table: "UserLessonProgresses",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ExamPaperId",
                table: "UserLessonProgresses",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TimeSpentSeconds",
                table: "UserLessonProgresses",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TotalPoints",
                table: "UserLessonProgresses",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "WrongAnswers",
                table: "UserLessonProgresses",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<int>(
                name: "LessonId",
                table: "Questions",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Questions",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GETDATE()");

            migrationBuilder.AddColumn<int>(
                name: "DialogueId",
                table: "Questions",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DifficultyLevel",
                table: "Questions",
                type: "int",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<string>(
                name: "Explanation",
                table: "Questions",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Points",
                table: "Questions",
                type: "int",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<int>(
                name: "ReadingPassageId",
                table: "Questions",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SentencePatternId",
                table: "Questions",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "OptionText",
                table: "QuestionOptions",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<bool>(
                name: "IsCorrect",
                table: "QuestionOptions",
                type: "bit",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AddColumn<string>(
                name: "Explanation",
                table: "QuestionOptions",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OptionLabel",
                table: "QuestionOptions",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Content",
                table: "Lessons",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Lessons",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GETDATE()");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Lessons",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Lessons",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsLocked",
                table: "Lessons",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<int>(
                name: "PrerequisiteLessonId",
                table: "Lessons",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CategoryId",
                table: "Courses",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Courses",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GETDATE()");

            migrationBuilder.AddColumn<int>(
                name: "HSKLevel",
                table: "Courses",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Courses",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<int>(
                name: "SortOrder",
                table: "Courses",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "CourseCategories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    DisplayName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IconUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourseCategories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Dialogues",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LessonId = table.Column<int>(type: "int", nullable: true),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    DialogueText = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Pinyin = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Translation = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AudioUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SceneDescription = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Category = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    DifficultyLevel = table.Column<int>(type: "int", nullable: false, defaultValue: 1),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Dialogues", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Dialogues_Lessons_LessonId",
                        column: x => x.LessonId,
                        principalTable: "Lessons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "ExamPapers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ExamType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Level = table.Column<int>(type: "int", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DurationMinutes = table.Column<int>(type: "int", nullable: false),
                    TotalQuestions = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    TotalPoints = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    PassingScore = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExamPapers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ExamResultAnalyses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserProgressId = table.Column<int>(type: "int", nullable: false),
                    SkillType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Score = table.Column<int>(type: "int", nullable: false),
                    MaxScore = table.Column<int>(type: "int", nullable: false),
                    CorrectCount = table.Column<int>(type: "int", nullable: false),
                    WrongCount = table.Column<int>(type: "int", nullable: false),
                    AverageTimeSeconds = table.Column<int>(type: "int", nullable: true),
                    Strengths = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Weaknesses = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Recommendations = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExamResultAnalyses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExamResultAnalyses_UserLessonProgresses_UserProgressId",
                        column: x => x.UserProgressId,
                        principalTable: "UserLessonProgresses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FavoriteWords",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    WordId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FavoriteWords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FavoriteWords_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FavoriteWords_Words_WordId",
                        column: x => x.WordId,
                        principalTable: "Words",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MeasureWords",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Character = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Pinyin = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Meaning = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    UsageDescription = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Category = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MeasureWords", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Radicals",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Character = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Pinyin = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Meaning = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    StrokeCount = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AnimationUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Radicals", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ReadingPassages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LessonId = table.Column<int>(type: "int", nullable: true),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    PassageText = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Pinyin = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Translation = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DifficultyLevel = table.Column<int>(type: "int", nullable: false, defaultValue: 1),
                    WordCount = table.Column<int>(type: "int", nullable: true),
                    Category = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReadingPassages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReadingPassages_Lessons_LessonId",
                        column: x => x.LessonId,
                        principalTable: "Lessons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "SentencePatterns",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LessonId = table.Column<int>(type: "int", nullable: true),
                    PatternText = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Pinyin = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Meaning = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Usage = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ExampleSentences = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Category = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    DifficultyLevel = table.Column<int>(type: "int", nullable: false, defaultValue: 1),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SentencePatterns", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SentencePatterns_Lessons_LessonId",
                        column: x => x.LessonId,
                        principalTable: "Lessons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "TranslationHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    SourceText = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SourceLanguage = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TranslatedText = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TargetLanguage = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TranslationHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TranslationHistories_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserAnswers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserProgressId = table.Column<int>(type: "int", nullable: false),
                    QuestionId = table.Column<int>(type: "int", nullable: false),
                    SelectedOptionId = table.Column<int>(type: "int", nullable: true),
                    UserAnswerText = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsCorrect = table.Column<bool>(type: "bit", nullable: false),
                    PointsEarned = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    TimeSpentSeconds = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserAnswers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserAnswers_QuestionOptions_SelectedOptionId",
                        column: x => x.SelectedOptionId,
                        principalTable: "QuestionOptions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserAnswers_Questions_QuestionId",
                        column: x => x.QuestionId,
                        principalTable: "Questions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserAnswers_UserLessonProgresses_UserProgressId",
                        column: x => x.UserProgressId,
                        principalTable: "UserLessonProgresses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserCourseStatuses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    CourseId = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "NotStarted"),
                    ProgressPercentage = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    StartedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserCourseStatuses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserCourseStatuses_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserCourseStatuses_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserDailyStats",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    StatDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    WordsLearned = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    WordsReviewed = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    LessonsCompleted = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    QuestionsAnswered = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    CorrectAnswers = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    StudyTimeMinutes = table.Column<int>(type: "int", nullable: false, defaultValue: 0)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserDailyStats", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserDailyStats_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserLessonStatuses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    LessonId = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "NotStarted"),
                    ProgressPercentage = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    StartedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastAccessedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserLessonStatuses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserLessonStatuses_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserLessonStatuses_Lessons_LessonId",
                        column: x => x.LessonId,
                        principalTable: "Lessons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserPronunciationAttempts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    WordId = table.Column<int>(type: "int", nullable: true),
                    SentenceText = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    AudioUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Score = table.Column<int>(type: "int", nullable: true),
                    ToneAccuracy = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    PronunciationAccuracy = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Feedback = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    WaveformData = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AttemptedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserPronunciationAttempts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserPronunciationAttempts_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserPronunciationAttempts_Words_WordId",
                        column: x => x.WordId,
                        principalTable: "Words",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "VocabularyTopics",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VocabularyTopics", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WritingExercises",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LessonId = table.Column<int>(type: "int", nullable: true),
                    WordId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Instructions = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    StrokeOrderGuide = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AnimationUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ExpectedStrokeCount = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WritingExercises", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WritingExercises_Lessons_LessonId",
                        column: x => x.LessonId,
                        principalTable: "Lessons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_WritingExercises_Words_WordId",
                        column: x => x.WordId,
                        principalTable: "Words",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DialogueSentences",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DialogueId = table.Column<int>(type: "int", nullable: false),
                    SentenceText = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Pinyin = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Translation = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Speaker = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    SentenceIndex = table.Column<int>(type: "int", nullable: false),
                    AudioUrl = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DialogueSentences", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DialogueSentences_Dialogues_DialogueId",
                        column: x => x.DialogueId,
                        principalTable: "Dialogues",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserDialogueProgresses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    DialogueId = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "NotStarted"),
                    TimesListened = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    LastAccessedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserDialogueProgresses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserDialogueProgresses_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserDialogueProgresses_Dialogues_DialogueId",
                        column: x => x.DialogueId,
                        principalTable: "Dialogues",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ExamPaperQuestions",
                columns: table => new
                {
                    ExamPaperId = table.Column<int>(type: "int", nullable: false),
                    QuestionId = table.Column<int>(type: "int", nullable: false),
                    QuestionOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExamPaperQuestions", x => new { x.ExamPaperId, x.QuestionId });
                    table.ForeignKey(
                        name: "FK_ExamPaperQuestions_ExamPapers_ExamPaperId",
                        column: x => x.ExamPaperId,
                        principalTable: "ExamPapers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ExamPaperQuestions_Questions_QuestionId",
                        column: x => x.QuestionId,
                        principalTable: "Questions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Leaderboards",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    ExamPaperId = table.Column<int>(type: "int", nullable: false),
                    Score = table.Column<int>(type: "int", nullable: false),
                    TotalPoints = table.Column<int>(type: "int", nullable: false),
                    Ranking = table.Column<int>(type: "int", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TimeSpentSeconds = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Leaderboards", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Leaderboards_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Leaderboards_ExamPapers_ExamPaperId",
                        column: x => x.ExamPaperId,
                        principalTable: "ExamPapers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MeasureWordExamples",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MeasureWordId = table.Column<int>(type: "int", nullable: false),
                    ExampleText = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Pinyin = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Translation = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Explanation = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false, defaultValue: 0)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MeasureWordExamples", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MeasureWordExamples_MeasureWords_MeasureWordId",
                        column: x => x.MeasureWordId,
                        principalTable: "MeasureWords",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WordMeasureWords",
                columns: table => new
                {
                    WordId = table.Column<int>(type: "int", nullable: false),
                    MeasureWordId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WordMeasureWords", x => new { x.WordId, x.MeasureWordId });
                    table.ForeignKey(
                        name: "FK_WordMeasureWords_MeasureWords_MeasureWordId",
                        column: x => x.MeasureWordId,
                        principalTable: "MeasureWords",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WordMeasureWords_Words_WordId",
                        column: x => x.WordId,
                        principalTable: "Words",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserRadicalProgresses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    RadicalId = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "NotStarted"),
                    PracticeCount = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    BestScore = table.Column<int>(type: "int", nullable: true),
                    LastPracticedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    MasteredAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserRadicalProgresses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserRadicalProgresses_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserRadicalProgresses_Radicals_RadicalId",
                        column: x => x.RadicalId,
                        principalTable: "Radicals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WordRadicals",
                columns: table => new
                {
                    WordId = table.Column<int>(type: "int", nullable: false),
                    RadicalId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WordRadicals", x => new { x.WordId, x.RadicalId });
                    table.ForeignKey(
                        name: "FK_WordRadicals_Radicals_RadicalId",
                        column: x => x.RadicalId,
                        principalTable: "Radicals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WordRadicals_Words_WordId",
                        column: x => x.WordId,
                        principalTable: "Words",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ReadingPassageWords",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PassageId = table.Column<int>(type: "int", nullable: false),
                    WordId = table.Column<int>(type: "int", nullable: false),
                    PositionInText = table.Column<int>(type: "int", nullable: false),
                    Context = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReadingPassageWords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReadingPassageWords_ReadingPassages_PassageId",
                        column: x => x.PassageId,
                        principalTable: "ReadingPassages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ReadingPassageWords_Words_WordId",
                        column: x => x.WordId,
                        principalTable: "Words",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserReadingProgresses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    PassageId = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "NotStarted"),
                    ReadingTimeSeconds = table.Column<int>(type: "int", nullable: true),
                    WordsMarkedCount = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    LastAccessedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserReadingProgresses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserReadingProgresses_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserReadingProgresses_ReadingPassages_PassageId",
                        column: x => x.PassageId,
                        principalTable: "ReadingPassages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserReadingWordMarks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    PassageId = table.Column<int>(type: "int", nullable: false),
                    WordId = table.Column<int>(type: "int", nullable: false),
                    MarkType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "Unknown"),
                    Notes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserReadingWordMarks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserReadingWordMarks_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserReadingWordMarks_ReadingPassages_PassageId",
                        column: x => x.PassageId,
                        principalTable: "ReadingPassages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserReadingWordMarks_Words_WordId",
                        column: x => x.WordId,
                        principalTable: "Words",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FavoriteSentencePatterns",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    SentencePatternId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FavoriteSentencePatterns", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FavoriteSentencePatterns_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FavoriteSentencePatterns_SentencePatterns_SentencePatternId",
                        column: x => x.SentencePatternId,
                        principalTable: "SentencePatterns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SentencePatternExamples",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SentencePatternId = table.Column<int>(type: "int", nullable: false),
                    ExampleText = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Pinyin = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Translation = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    AudioUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false, defaultValue: 0)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SentencePatternExamples", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SentencePatternExamples_SentencePatterns_SentencePatternId",
                        column: x => x.SentencePatternId,
                        principalTable: "SentencePatterns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WordVocabularyTopics",
                columns: table => new
                {
                    WordId = table.Column<int>(type: "int", nullable: false),
                    VocabularyTopicId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WordVocabularyTopics", x => new { x.WordId, x.VocabularyTopicId });
                    table.ForeignKey(
                        name: "FK_WordVocabularyTopics_VocabularyTopics_VocabularyTopicId",
                        column: x => x.VocabularyTopicId,
                        principalTable: "VocabularyTopics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WordVocabularyTopics_Words_WordId",
                        column: x => x.WordId,
                        principalTable: "Words",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserWritingAttempts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    WritingExerciseId = table.Column<int>(type: "int", nullable: false),
                    StrokeCount = table.Column<int>(type: "int", nullable: true),
                    CorrectStrokeCount = table.Column<int>(type: "int", nullable: true),
                    StrokeData = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Score = table.Column<int>(type: "int", nullable: true),
                    AttemptedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserWritingAttempts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserWritingAttempts_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserWritingAttempts_WritingExercises_WritingExerciseId",
                        column: x => x.WritingExerciseId,
                        principalTable: "WritingExercises",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserWritingProgresses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    WritingExerciseId = table.Column<int>(type: "int", nullable: false),
                    AttemptsCount = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    BestScore = table.Column<int>(type: "int", nullable: true),
                    LastAttemptAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsCompleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserWritingProgresses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserWritingProgresses_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserWritingProgresses_WritingExercises_WritingExerciseId",
                        column: x => x.WritingExerciseId,
                        principalTable: "WritingExercises",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Words_Character",
                table: "Words",
                column: "Character");

            migrationBuilder.CreateIndex(
                name: "IX_Words_HSKLevel",
                table: "Words",
                column: "HSKLevel");

            migrationBuilder.CreateIndex(
                name: "IX_UserWordProgresses_Status",
                table: "UserWordProgresses",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_UserWordProgresses_UserId_NextReviewDate",
                table: "UserWordProgresses",
                columns: new[] { "UserId", "NextReviewDate" });

            migrationBuilder.CreateIndex(
                name: "IX_UserLessonProgresses_CompletedAt",
                table: "UserLessonProgresses",
                column: "CompletedAt");

            migrationBuilder.CreateIndex(
                name: "IX_UserLessonProgresses_ExamPaperId",
                table: "UserLessonProgresses",
                column: "ExamPaperId");

            migrationBuilder.CreateIndex(
                name: "IX_Questions_DialogueId",
                table: "Questions",
                column: "DialogueId");

            migrationBuilder.CreateIndex(
                name: "IX_Questions_QuestionType",
                table: "Questions",
                column: "QuestionType");

            migrationBuilder.CreateIndex(
                name: "IX_Questions_ReadingPassageId",
                table: "Questions",
                column: "ReadingPassageId");

            migrationBuilder.CreateIndex(
                name: "IX_Questions_SentencePatternId",
                table: "Questions",
                column: "SentencePatternId");

            migrationBuilder.CreateIndex(
                name: "IX_Lessons_CourseId_LessonIndex",
                table: "Lessons",
                columns: new[] { "CourseId", "LessonIndex" });

            migrationBuilder.CreateIndex(
                name: "IX_Lessons_PrerequisiteLessonId",
                table: "Lessons",
                column: "PrerequisiteLessonId");

            migrationBuilder.CreateIndex(
                name: "IX_Courses_CategoryId",
                table: "Courses",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_CourseCategories_Name",
                table: "CourseCategories",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Dialogues_Category",
                table: "Dialogues",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_Dialogues_DifficultyLevel",
                table: "Dialogues",
                column: "DifficultyLevel");

            migrationBuilder.CreateIndex(
                name: "IX_Dialogues_LessonId",
                table: "Dialogues",
                column: "LessonId");

            migrationBuilder.CreateIndex(
                name: "IX_DialogueSentences_DialogueId",
                table: "DialogueSentences",
                column: "DialogueId");

            migrationBuilder.CreateIndex(
                name: "IX_ExamPaperQuestions_QuestionId",
                table: "ExamPaperQuestions",
                column: "QuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_ExamResultAnalyses_UserProgressId",
                table: "ExamResultAnalyses",
                column: "UserProgressId");

            migrationBuilder.CreateIndex(
                name: "IX_FavoriteSentencePatterns_SentencePatternId",
                table: "FavoriteSentencePatterns",
                column: "SentencePatternId");

            migrationBuilder.CreateIndex(
                name: "IX_FavoriteSentencePatterns_UserId_SentencePatternId",
                table: "FavoriteSentencePatterns",
                columns: new[] { "UserId", "SentencePatternId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FavoriteWords_UserId",
                table: "FavoriteWords",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_FavoriteWords_UserId_WordId",
                table: "FavoriteWords",
                columns: new[] { "UserId", "WordId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FavoriteWords_WordId",
                table: "FavoriteWords",
                column: "WordId");

            migrationBuilder.CreateIndex(
                name: "IX_Leaderboards_ExamPaperId_Score",
                table: "Leaderboards",
                columns: new[] { "ExamPaperId", "Score" });

            migrationBuilder.CreateIndex(
                name: "IX_Leaderboards_UserId_ExamPaperId",
                table: "Leaderboards",
                columns: new[] { "UserId", "ExamPaperId" });

            migrationBuilder.CreateIndex(
                name: "IX_MeasureWordExamples_MeasureWordId",
                table: "MeasureWordExamples",
                column: "MeasureWordId");

            migrationBuilder.CreateIndex(
                name: "IX_Radicals_Character",
                table: "Radicals",
                column: "Character",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ReadingPassages_DifficultyLevel",
                table: "ReadingPassages",
                column: "DifficultyLevel");

            migrationBuilder.CreateIndex(
                name: "IX_ReadingPassages_LessonId",
                table: "ReadingPassages",
                column: "LessonId");

            migrationBuilder.CreateIndex(
                name: "IX_ReadingPassageWords_PassageId",
                table: "ReadingPassageWords",
                column: "PassageId");

            migrationBuilder.CreateIndex(
                name: "IX_ReadingPassageWords_WordId",
                table: "ReadingPassageWords",
                column: "WordId");

            migrationBuilder.CreateIndex(
                name: "IX_SentencePatternExamples_SentencePatternId",
                table: "SentencePatternExamples",
                column: "SentencePatternId");

            migrationBuilder.CreateIndex(
                name: "IX_SentencePatterns_LessonId",
                table: "SentencePatterns",
                column: "LessonId");

            migrationBuilder.CreateIndex(
                name: "IX_TranslationHistories_UserId",
                table: "TranslationHistories",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserAnswers_QuestionId",
                table: "UserAnswers",
                column: "QuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_UserAnswers_SelectedOptionId",
                table: "UserAnswers",
                column: "SelectedOptionId");

            migrationBuilder.CreateIndex(
                name: "IX_UserAnswers_UserProgressId",
                table: "UserAnswers",
                column: "UserProgressId");

            migrationBuilder.CreateIndex(
                name: "IX_UserCourseStatuses_CourseId",
                table: "UserCourseStatuses",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_UserCourseStatuses_UserId_CourseId",
                table: "UserCourseStatuses",
                columns: new[] { "UserId", "CourseId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserDailyStats_UserId_StatDate",
                table: "UserDailyStats",
                columns: new[] { "UserId", "StatDate" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserDialogueProgresses_DialogueId",
                table: "UserDialogueProgresses",
                column: "DialogueId");

            migrationBuilder.CreateIndex(
                name: "IX_UserDialogueProgresses_UserId",
                table: "UserDialogueProgresses",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserDialogueProgresses_UserId_DialogueId",
                table: "UserDialogueProgresses",
                columns: new[] { "UserId", "DialogueId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserLessonStatuses_LessonId",
                table: "UserLessonStatuses",
                column: "LessonId");

            migrationBuilder.CreateIndex(
                name: "IX_UserLessonStatuses_UserId_LessonId",
                table: "UserLessonStatuses",
                columns: new[] { "UserId", "LessonId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserPronunciationAttempts_AttemptedAt",
                table: "UserPronunciationAttempts",
                column: "AttemptedAt");

            migrationBuilder.CreateIndex(
                name: "IX_UserPronunciationAttempts_UserId",
                table: "UserPronunciationAttempts",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserPronunciationAttempts_WordId",
                table: "UserPronunciationAttempts",
                column: "WordId");

            migrationBuilder.CreateIndex(
                name: "IX_UserRadicalProgresses_RadicalId",
                table: "UserRadicalProgresses",
                column: "RadicalId");

            migrationBuilder.CreateIndex(
                name: "IX_UserRadicalProgresses_Status",
                table: "UserRadicalProgresses",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_UserRadicalProgresses_UserId",
                table: "UserRadicalProgresses",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserRadicalProgresses_UserId_RadicalId",
                table: "UserRadicalProgresses",
                columns: new[] { "UserId", "RadicalId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserReadingProgresses_PassageId",
                table: "UserReadingProgresses",
                column: "PassageId");

            migrationBuilder.CreateIndex(
                name: "IX_UserReadingProgresses_UserId",
                table: "UserReadingProgresses",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserReadingProgresses_UserId_PassageId",
                table: "UserReadingProgresses",
                columns: new[] { "UserId", "PassageId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserReadingWordMarks_PassageId",
                table: "UserReadingWordMarks",
                column: "PassageId");

            migrationBuilder.CreateIndex(
                name: "IX_UserReadingWordMarks_UserId_PassageId",
                table: "UserReadingWordMarks",
                columns: new[] { "UserId", "PassageId" });

            migrationBuilder.CreateIndex(
                name: "IX_UserReadingWordMarks_UserId_PassageId_WordId",
                table: "UserReadingWordMarks",
                columns: new[] { "UserId", "PassageId", "WordId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserReadingWordMarks_WordId",
                table: "UserReadingWordMarks",
                column: "WordId");

            migrationBuilder.CreateIndex(
                name: "IX_UserWritingAttempts_UserId",
                table: "UserWritingAttempts",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserWritingAttempts_WritingExerciseId",
                table: "UserWritingAttempts",
                column: "WritingExerciseId");

            migrationBuilder.CreateIndex(
                name: "IX_UserWritingProgresses_UserId_WritingExerciseId",
                table: "UserWritingProgresses",
                columns: new[] { "UserId", "WritingExerciseId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserWritingProgresses_WritingExerciseId",
                table: "UserWritingProgresses",
                column: "WritingExerciseId");

            migrationBuilder.CreateIndex(
                name: "IX_WordMeasureWords_MeasureWordId",
                table: "WordMeasureWords",
                column: "MeasureWordId");

            migrationBuilder.CreateIndex(
                name: "IX_WordRadicals_RadicalId",
                table: "WordRadicals",
                column: "RadicalId");

            migrationBuilder.CreateIndex(
                name: "IX_WordVocabularyTopics_VocabularyTopicId",
                table: "WordVocabularyTopics",
                column: "VocabularyTopicId");

            migrationBuilder.CreateIndex(
                name: "IX_WritingExercises_LessonId",
                table: "WritingExercises",
                column: "LessonId");

            migrationBuilder.CreateIndex(
                name: "IX_WritingExercises_WordId",
                table: "WritingExercises",
                column: "WordId");

            migrationBuilder.AddForeignKey(
                name: "FK_Courses_CourseCategories_CategoryId",
                table: "Courses",
                column: "CategoryId",
                principalTable: "CourseCategories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Lessons_Lessons_PrerequisiteLessonId",
                table: "Lessons",
                column: "PrerequisiteLessonId",
                principalTable: "Lessons",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Questions_Dialogues_DialogueId",
                table: "Questions",
                column: "DialogueId",
                principalTable: "Dialogues",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Questions_Lessons_LessonId",
                table: "Questions",
                column: "LessonId",
                principalTable: "Lessons",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Questions_ReadingPassages_ReadingPassageId",
                table: "Questions",
                column: "ReadingPassageId",
                principalTable: "ReadingPassages",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Questions_SentencePatterns_SentencePatternId",
                table: "Questions",
                column: "SentencePatternId",
                principalTable: "SentencePatterns",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_UserLessonProgresses_ExamPapers_ExamPaperId",
                table: "UserLessonProgresses",
                column: "ExamPaperId",
                principalTable: "ExamPapers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Words_Lessons_LessonId",
                table: "Words",
                column: "LessonId",
                principalTable: "Lessons",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Courses_CourseCategories_CategoryId",
                table: "Courses");

            migrationBuilder.DropForeignKey(
                name: "FK_Lessons_Lessons_PrerequisiteLessonId",
                table: "Lessons");

            migrationBuilder.DropForeignKey(
                name: "FK_Questions_Dialogues_DialogueId",
                table: "Questions");

            migrationBuilder.DropForeignKey(
                name: "FK_Questions_Lessons_LessonId",
                table: "Questions");

            migrationBuilder.DropForeignKey(
                name: "FK_Questions_ReadingPassages_ReadingPassageId",
                table: "Questions");

            migrationBuilder.DropForeignKey(
                name: "FK_Questions_SentencePatterns_SentencePatternId",
                table: "Questions");

            migrationBuilder.DropForeignKey(
                name: "FK_UserLessonProgresses_ExamPapers_ExamPaperId",
                table: "UserLessonProgresses");

            migrationBuilder.DropForeignKey(
                name: "FK_Words_Lessons_LessonId",
                table: "Words");

            migrationBuilder.DropTable(
                name: "CourseCategories");

            migrationBuilder.DropTable(
                name: "DialogueSentences");

            migrationBuilder.DropTable(
                name: "ExamPaperQuestions");

            migrationBuilder.DropTable(
                name: "ExamResultAnalyses");

            migrationBuilder.DropTable(
                name: "FavoriteSentencePatterns");

            migrationBuilder.DropTable(
                name: "FavoriteWords");

            migrationBuilder.DropTable(
                name: "Leaderboards");

            migrationBuilder.DropTable(
                name: "MeasureWordExamples");

            migrationBuilder.DropTable(
                name: "ReadingPassageWords");

            migrationBuilder.DropTable(
                name: "SentencePatternExamples");

            migrationBuilder.DropTable(
                name: "TranslationHistories");

            migrationBuilder.DropTable(
                name: "UserAnswers");

            migrationBuilder.DropTable(
                name: "UserCourseStatuses");

            migrationBuilder.DropTable(
                name: "UserDailyStats");

            migrationBuilder.DropTable(
                name: "UserDialogueProgresses");

            migrationBuilder.DropTable(
                name: "UserLessonStatuses");

            migrationBuilder.DropTable(
                name: "UserPronunciationAttempts");

            migrationBuilder.DropTable(
                name: "UserRadicalProgresses");

            migrationBuilder.DropTable(
                name: "UserReadingProgresses");

            migrationBuilder.DropTable(
                name: "UserReadingWordMarks");

            migrationBuilder.DropTable(
                name: "UserWritingAttempts");

            migrationBuilder.DropTable(
                name: "UserWritingProgresses");

            migrationBuilder.DropTable(
                name: "WordMeasureWords");

            migrationBuilder.DropTable(
                name: "WordRadicals");

            migrationBuilder.DropTable(
                name: "WordVocabularyTopics");

            migrationBuilder.DropTable(
                name: "ExamPapers");

            migrationBuilder.DropTable(
                name: "SentencePatterns");

            migrationBuilder.DropTable(
                name: "Dialogues");

            migrationBuilder.DropTable(
                name: "ReadingPassages");

            migrationBuilder.DropTable(
                name: "WritingExercises");

            migrationBuilder.DropTable(
                name: "MeasureWords");

            migrationBuilder.DropTable(
                name: "Radicals");

            migrationBuilder.DropTable(
                name: "VocabularyTopics");

            migrationBuilder.DropIndex(
                name: "IX_Words_Character",
                table: "Words");

            migrationBuilder.DropIndex(
                name: "IX_Words_HSKLevel",
                table: "Words");

            migrationBuilder.DropIndex(
                name: "IX_UserWordProgresses_Status",
                table: "UserWordProgresses");

            migrationBuilder.DropIndex(
                name: "IX_UserWordProgresses_UserId_NextReviewDate",
                table: "UserWordProgresses");

            migrationBuilder.DropIndex(
                name: "IX_UserLessonProgresses_CompletedAt",
                table: "UserLessonProgresses");

            migrationBuilder.DropIndex(
                name: "IX_UserLessonProgresses_ExamPaperId",
                table: "UserLessonProgresses");

            migrationBuilder.DropIndex(
                name: "IX_Questions_DialogueId",
                table: "Questions");

            migrationBuilder.DropIndex(
                name: "IX_Questions_QuestionType",
                table: "Questions");

            migrationBuilder.DropIndex(
                name: "IX_Questions_ReadingPassageId",
                table: "Questions");

            migrationBuilder.DropIndex(
                name: "IX_Questions_SentencePatternId",
                table: "Questions");

            migrationBuilder.DropIndex(
                name: "IX_Lessons_CourseId_LessonIndex",
                table: "Lessons");

            migrationBuilder.DropIndex(
                name: "IX_Lessons_PrerequisiteLessonId",
                table: "Lessons");

            migrationBuilder.DropIndex(
                name: "IX_Courses_CategoryId",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Words");

            migrationBuilder.DropColumn(
                name: "Frequency",
                table: "Words");

            migrationBuilder.DropColumn(
                name: "HSKLevel",
                table: "Words");

            migrationBuilder.DropColumn(
                name: "StrokeCount",
                table: "Words");

            migrationBuilder.DropColumn(
                name: "CorrectCount",
                table: "UserWordProgresses");

            migrationBuilder.DropColumn(
                name: "LastReviewedAt",
                table: "UserWordProgresses");

            migrationBuilder.DropColumn(
                name: "ReviewCount",
                table: "UserWordProgresses");

            migrationBuilder.DropColumn(
                name: "WrongCount",
                table: "UserWordProgresses");

            migrationBuilder.DropColumn(
                name: "CorrectAnswers",
                table: "UserLessonProgresses");

            migrationBuilder.DropColumn(
                name: "ExamPaperId",
                table: "UserLessonProgresses");

            migrationBuilder.DropColumn(
                name: "TimeSpentSeconds",
                table: "UserLessonProgresses");

            migrationBuilder.DropColumn(
                name: "TotalPoints",
                table: "UserLessonProgresses");

            migrationBuilder.DropColumn(
                name: "WrongAnswers",
                table: "UserLessonProgresses");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Questions");

            migrationBuilder.DropColumn(
                name: "DialogueId",
                table: "Questions");

            migrationBuilder.DropColumn(
                name: "DifficultyLevel",
                table: "Questions");

            migrationBuilder.DropColumn(
                name: "Explanation",
                table: "Questions");

            migrationBuilder.DropColumn(
                name: "Points",
                table: "Questions");

            migrationBuilder.DropColumn(
                name: "ReadingPassageId",
                table: "Questions");

            migrationBuilder.DropColumn(
                name: "SentencePatternId",
                table: "Questions");

            migrationBuilder.DropColumn(
                name: "Explanation",
                table: "QuestionOptions");

            migrationBuilder.DropColumn(
                name: "OptionLabel",
                table: "QuestionOptions");

            migrationBuilder.DropColumn(
                name: "Content",
                table: "Lessons");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Lessons");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Lessons");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Lessons");

            migrationBuilder.DropColumn(
                name: "IsLocked",
                table: "Lessons");

            migrationBuilder.DropColumn(
                name: "PrerequisiteLessonId",
                table: "Lessons");

            migrationBuilder.DropColumn(
                name: "CategoryId",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "HSKLevel",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "SortOrder",
                table: "Courses");

            migrationBuilder.AlterColumn<int>(
                name: "LessonId",
                table: "Words",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "LessonId",
                table: "UserLessonProgresses",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "LessonId",
                table: "Questions",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "OptionText",
                table: "QuestionOptions",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500);

            migrationBuilder.AlterColumn<bool>(
                name: "IsCorrect",
                table: "QuestionOptions",
                type: "bit",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldDefaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_Lessons_CourseId",
                table: "Lessons",
                column: "CourseId");

            migrationBuilder.AddForeignKey(
                name: "FK_Questions_Lessons_LessonId",
                table: "Questions",
                column: "LessonId",
                principalTable: "Lessons",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Words_Lessons_LessonId",
                table: "Words",
                column: "LessonId",
                principalTable: "Lessons",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
