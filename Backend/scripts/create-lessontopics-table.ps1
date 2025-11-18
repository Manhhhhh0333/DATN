[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Split-Path -Parent $scriptPath
$infrastructureProject = Join-Path $backendPath "src\HiHSK.Infrastructure"

Write-Host "Tao bang LessonTopics..." -ForegroundColor Green

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
    
    Write-Host "`nBuoc 2: Kiem tra trang thai migrations..." -ForegroundColor Yellow
    dotnet ef migrations list --startup-project ../HiHSK.Api
    
    Write-Host "`nBuoc 3: Apply migration tao bang LessonTopics..." -ForegroundColor Yellow
    Write-Host "  Migration: 20251107135905_AddLessonTopicAndExercise" -ForegroundColor Cyan
    
    dotnet ef database update 20251107135905_AddLessonTopicAndExercise --startup-project ../HiHSK.Api
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Da tao bang LessonTopics thanh cong!" -ForegroundColor Green
        
        Write-Host "`nBuoc 4: Kiem tra bang da duoc tao..." -ForegroundColor Yellow
        Write-Host "  SQL: SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'LessonTopics'" -ForegroundColor Gray
        
        Write-Host "`nBuoc 5: Seed 12 topics cho HSK1..." -ForegroundColor Yellow
        Write-Host "  File: Backend/scripts/seed-12-topics-hsk1.sql" -ForegroundColor Cyan
        Write-Host "  Hoac chay migration seed:" -ForegroundColor Cyan
        Write-Host "    dotnet ef database update 20250116000000_Seed12LessonTopicsHsk1 --startup-project ../HiHSK.Api" -ForegroundColor Gray
    }
    else {
        Write-Host "`n❌ Co loi khi apply migration!" -ForegroundColor Red
        Write-Host "`nThu cach khac: Apply tat ca migrations tu dau" -ForegroundColor Yellow
        Write-Host "  dotnet ef database update --startup-project ../HiHSK.Api" -ForegroundColor Cyan
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

