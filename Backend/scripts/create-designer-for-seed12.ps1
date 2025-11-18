[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Split-Path -Parent $scriptPath
$migrationsPath = Join-Path $backendPath "src\HiHSK.Infrastructure\Migrations"

Write-Host "Tao file Designer.cs cho migration Seed12LessonTopicsHsk1..." -ForegroundColor Green

$sourceFile = Join-Path $migrationsPath "20251109020524_UpdateSeedHSK1DataWithoutLessons.Designer.cs"
$targetFile = Join-Path $migrationsPath "20250116000000_Seed12LessonTopicsHsk1.Designer.cs"

if (-not (Test-Path $sourceFile)) {
    Write-Host "Loi: Khong tim thay file nguon: $sourceFile" -ForegroundColor Red
    exit 1
}

if (Test-Path $targetFile) {
    Write-Host "File da ton tai. Dang xoa file cu..." -ForegroundColor Yellow
    Remove-Item $targetFile -Force
}

Write-Host "Dang copy va sua file Designer.cs..." -ForegroundColor Yellow

# Doc noi dung file nguon
$content = Get-Content $sourceFile -Raw -Encoding UTF8

# Thay the ten migration va class name
# Su dung single quotes de tranh conflict voi dau ngoac kep
$oldMigrationText = '[Migration("20251109020524_UpdateSeedHSK1DataWithoutLessons")]'
$newMigrationText = '[Migration("20250116000000_Seed12LessonTopicsHsk1")]'
$content = $content.Replace($oldMigrationText, $newMigrationText)

$oldClass = 'partial class UpdateSeedHSK1DataWithoutLessons'
$newClass = 'partial class Seed12LessonTopicsHsk1'
$content = $content.Replace($oldClass, $newClass)

# Ghi file moi
[System.IO.File]::WriteAllText($targetFile, $content, [System.Text.Encoding]::UTF8)

Write-Host "Da tao file: $targetFile" -ForegroundColor Green
Write-Host ""
Write-Host "Buoc tiep theo:" -ForegroundColor Yellow
Write-Host "  1. Rebuild project: cd Backend/src/HiHSK.Infrastructure && dotnet build" -ForegroundColor Cyan
Write-Host "  2. Kiem tra migrations: dotnet ef migrations list --startup-project ../HiHSK.Api" -ForegroundColor Cyan
Write-Host "  3. Apply migration: dotnet ef database update --startup-project ../HiHSK.Api" -ForegroundColor Cyan
