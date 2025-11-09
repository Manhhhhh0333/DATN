# Script để tạo và chạy migration update seed data HSK1 (không có lessons)
# Migration này sẽ seed data từ file seed-data-hsk1.json (đã xóa phần lessons)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Update Seed Data Migration - HSK1" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra file JSON
$jsonPath = Join-Path $PSScriptRoot "..\data\seed-data-hsk1.json"
if (-not (Test-Path $jsonPath)) {
    Write-Host "ERROR: Không tìm thấy file seed-data-hsk1.json tại: $jsonPath" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Tìm thấy file seed data: $jsonPath" -ForegroundColor Green
Write-Host ""

# Di chuyển đến thư mục Infrastructure
$infraPath = Join-Path $PSScriptRoot "..\src\HiHSK.Infrastructure"
if (-not (Test-Path $infraPath)) {
    Write-Host "ERROR: Không tìm thấy thư mục HiHSK.Infrastructure" -ForegroundColor Red
    exit 1
}

Set-Location $infraPath
Write-Host "Đang ở thư mục: $(Get-Location)" -ForegroundColor Yellow
Write-Host ""

# Kiểm tra xem migration đã tồn tại chưa
$migrationPath = Join-Path $infraPath "Migrations\20250115000000_UpdateSeedHSK1DataWithoutLessons.cs"
if (Test-Path $migrationPath) {
    Write-Host "✓ Migration file đã tồn tại" -ForegroundColor Green
    Write-Host ""
    
    # Tạo Designer file bằng EF Core (nếu chưa có)
    $designerPath = Join-Path $infraPath "Migrations\20250115000000_UpdateSeedHSK1DataWithoutLessons.Designer.cs"
    if (-not (Test-Path $designerPath)) {
        Write-Host "Tạo Designer file cho migration..." -ForegroundColor Yellow
        Write-Host "Lưu ý: Cần chạy lệnh sau để tạo Designer file:" -ForegroundColor Yellow
        Write-Host "  dotnet ef migrations add UpdateSeedHSK1DataWithoutLessons --startup-project ../HiHSK.Api" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Hoặc nếu migration đã được thêm vào database context:" -ForegroundColor Yellow
        Write-Host "  dotnet ef migrations script --startup-project ../HiHSK.Api" -ForegroundColor Yellow
        Write-Host ""
    }
} else {
    Write-Host "Tạo migration mới..." -ForegroundColor Yellow
    Write-Host "Chạy lệnh: dotnet ef migrations add UpdateSeedHSK1DataWithoutLessons --startup-project ../HiHSK.Api" -ForegroundColor Yellow
    Write-Host ""
}

# Hướng dẫn chạy migration
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Hướng dẫn chạy migration:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Tạo migration (nếu chưa có Designer file):" -ForegroundColor White
Write-Host "   dotnet ef migrations add UpdateSeedHSK1DataWithoutLessons --startup-project ../HiHSK.Api" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Chạy migration:" -ForegroundColor White
Write-Host "   dotnet ef database update --startup-project ../HiHSK.Api" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Kiểm tra dữ liệu:" -ForegroundColor White
Write-Host "   SELECT COUNT(*) FROM CourseCategories;" -ForegroundColor Gray
Write-Host "   SELECT COUNT(*) FROM Courses;" -ForegroundColor Gray
Write-Host "   SELECT COUNT(*) FROM Words WHERE HSKLevel = 1;" -ForegroundColor Gray
Write-Host ""
Write-Host "Lưu ý: Migration này sẽ seed:" -ForegroundColor Yellow
Write-Host "  - CourseCategories (HSK1)" -ForegroundColor Gray
Write-Host "  - Courses (HSK 1 - Khóa học cơ bản)" -ForegroundColor Gray
Write-Host "  - Words (150 từ vựng HSK1, không có LessonId)" -ForegroundColor Gray
Write-Host "  - VocabularyTopics (HSK 1)" -ForegroundColor Gray
Write-Host "  - WordVocabularyTopics (gán từ vựng vào topic)" -ForegroundColor Gray
Write-Host "  - KHÔNG seed Lessons (đã xóa khỏi file JSON)" -ForegroundColor Gray
Write-Host ""

