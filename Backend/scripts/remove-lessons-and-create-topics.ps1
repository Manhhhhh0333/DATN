[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Split-Path -Parent $scriptPath
$infrastructureProject = Join-Path $backendPath "src\HiHSK.Infrastructure"

Write-Host "Xoa bang Lessons va tao bang LessonTopics..." -ForegroundColor Green

if (-not (Test-Path $infrastructureProject)) {
    Write-Host "Loi: Khong tim thay project tai $infrastructureProject" -ForegroundColor Red
    exit 1
}

Push-Location $infrastructureProject
try {
    Write-Host "`nBuoc 1: Build project..." -ForegroundColor Yellow
    dotnet build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Build that bai!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "`nBuoc 2: Apply migration xoa Lessons va tao LessonTopics..." -ForegroundColor Yellow
    Write-Host "  Migration: 20250117000000_RemoveLessonsTableAndEnsureLessonTopics" -ForegroundColor Cyan
    
    dotnet ef database update 20250117000000_RemoveLessonsTableAndEnsureLessonTopics --startup-project ../HiHSK.Api
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Da xoa bang Lessons va tao bang LessonTopics thanh cong!" -ForegroundColor Green
        
        Write-Host "`nBuoc 3: Kiem tra bang LessonTopics..." -ForegroundColor Yellow
        Write-Host "  SQL: SELECT COUNT(*) FROM LessonTopics" -ForegroundColor Gray
        
        Write-Host "`nBuoc 4: Seed 12 topics cho HSK1 (neu can)..." -ForegroundColor Yellow
        Write-Host "  File: Backend/scripts/seed-12-topics-hsk1.sql" -ForegroundColor Cyan
    }
    else {
        Write-Host "`n❌ Co loi khi apply migration!" -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "Loi: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
finally {
    Pop-Location
}

