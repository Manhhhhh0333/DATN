[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Split-Path -Parent $scriptPath
$infrastructureProject = Join-Path $backendPath "src\HiHSK.Infrastructure"
$apiProject = Join-Path $backendPath "src\HiHSK.Api"

Write-Host "Apply migration tao bang LessonTopics..." -ForegroundColor Green

if (-not (Test-Path $infrastructureProject)) {
    Write-Host "Loi: Khong tim thay project tai $infrastructureProject" -ForegroundColor Red
    exit 1
}

Push-Location $infrastructureProject
try {
    Write-Host "`nBuoc 1: Kiem tra migrations..." -ForegroundColor Yellow
    $migrations = dotnet ef migrations list --startup-project ../HiHSK.Api --no-build 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Loi khi kiem tra migrations. Dang build project..." -ForegroundColor Yellow
        dotnet build
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Build that bai!" -ForegroundColor Red
            exit 1
        }
        $migrations = dotnet ef migrations list --startup-project ../HiHSK.Api 2>&1
    }
    
    Write-Host "`nDanh sach migrations:" -ForegroundColor Cyan
    $migrations | ForEach-Object {
        if ($_ -match "^\s*\*\s*(.+)") {
            Write-Host "  Da apply: $($matches[1])" -ForegroundColor Green
        }
        elseif ($_ -match "^\s*(.+)") {
            Write-Host "  Chua apply: $($matches[1])" -ForegroundColor Yellow
        }
    }
    
    Write-Host "`nBuoc 2: Apply migration tao bang LessonTopics..." -ForegroundColor Yellow
    Write-Host "  Migration: 20251107135905_AddLessonTopicAndExercise" -ForegroundColor Cyan
    
    dotnet ef database update 20251107135905_AddLessonTopicAndExercise --startup-project ../HiHSK.Api
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Da tao bang LessonTopics thanh cong!" -ForegroundColor Green
        Write-Host "`nBuoc 3: Kiem tra bang da duoc tao..." -ForegroundColor Yellow
        Write-Host "  (Co the kiem tra trong SQL Server Management Studio)" -ForegroundColor Gray
        Write-Host "  SQL: SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'LessonTopics'" -ForegroundColor Gray
        
        Write-Host "`nBuoc 4: Apply migration seed (neu can)..." -ForegroundColor Yellow
        Write-Host "  dotnet ef database update 20250116000000_Seed12LessonTopicsHsk1 --startup-project ../HiHSK.Api" -ForegroundColor Cyan
        Write-Host "  Hoac chay SQL seed tu file: Backend/scripts/seed-12-topics-hsk1.sql" -ForegroundColor Cyan
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

