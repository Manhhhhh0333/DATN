using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HiHSK.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUserActivityProgress : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UserActivityProgresses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    HskLevel = table.Column<int>(type: "int", nullable: true),
                    PartNumber = table.Column<int>(type: "int", nullable: true),
                    TopicId = table.Column<int>(type: "int", nullable: true),
                    ActivityId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    IsCompleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    Score = table.Column<int>(type: "int", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserActivityProgresses", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserActivityProgresses_HskLevel_PartNumber",
                table: "UserActivityProgresses",
                columns: new[] { "HskLevel", "PartNumber" });

            migrationBuilder.CreateIndex(
                name: "IX_UserActivityProgresses_TopicId",
                table: "UserActivityProgresses",
                column: "TopicId");

            migrationBuilder.CreateIndex(
                name: "IX_UserActivityProgresses_UserId",
                table: "UserActivityProgresses",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserActivityProgresses_UserId_HskLevel_PartNumber_ActivityId",
                table: "UserActivityProgresses",
                columns: new[] { "UserId", "HskLevel", "PartNumber", "ActivityId" },
                unique: true,
                filter: "[HskLevel] IS NOT NULL AND [PartNumber] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_UserActivityProgresses_UserId_TopicId_ActivityId",
                table: "UserActivityProgresses",
                columns: new[] { "UserId", "TopicId", "ActivityId" },
                unique: true,
                filter: "[TopicId] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserActivityProgresses");
        }
    }
}
