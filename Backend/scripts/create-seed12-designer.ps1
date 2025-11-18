[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Split-Path -Parent $scriptPath
$migrationsPath = Join-Path $backendPath "src\HiHSK.Infrastructure\Migrations"

Write-Host "Tạo file Designer.cs cho migration Seed12LessonTopicsHsk1..." -ForegroundColor Green

$sourceFile = Join-Path $migrationsPath "20251109020524_UpdateSeedHSK1DataWithoutLessons.Designer.cs"
$targetFile = Join-Path $migrationsPath "20250116000000_Seed12LessonTopicsHsk1.Designer.cs"

if (-not (Test-Path $sourceFile)) {
    Write-Host "Lỗi: Không tìm thấy file nguồn: $sourceFile" -ForegroundColor Red
    exit 1
}

Write-Host "Đang copy và sửa file Designer.cs..." -ForegroundColor Yellow

# Đọc nội dung file nguồn
$content = Get-Content $sourceFile -Raw -Encoding UTF8

# Thay thế tên migration
$content = $content -replace '\[Migration\("20251109020524_UpdateSeedHSK1DataWithoutLessons"\)\]', '[Migration("20250116000000_Seed12LessonTopicsHsk1")]'
$content = $content -replace 'partial class UpdateSeedHSK1DataWithoutLessons', 'partial class Seed12LessonTopicsHsk1'

# Ghi file mới
$content | Set-Content $targetFile -Encoding UTF8 -NoNewline

Write-Host "✅ Đã tạo file: $targetFile" -ForegroundColor Green
Write-Host "`nBước tiếp theo:" -ForegroundColor Yellow
Write-Host "  1. Rebuild project: dotnet build" -ForegroundColor Cyan
Write-Host "  2. Kiểm tra migrations: dotnet ef migrations list --startup-project ../HiHSK.Api" -ForegroundColor Cyan
Write-Host "  3. Apply migration: dotnet ef database update --startup-project ../HiHSK.Api" -ForegroundColor Cyan

