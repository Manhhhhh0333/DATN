[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Split-Path -Parent $scriptPath
$infrastructureProject = Join-Path $backendPath "src\HiHSK.Infrastructure"
$apiProject = Join-Path $backendPath "src\HiHSK.Api"

Write-Host "Kiểm tra thứ tự migrations..." -ForegroundColor Green

if (-not (Test-Path $infrastructureProject)) {
    Write-Host "Lỗi: Không tìm thấy project tại $infrastructureProject" -ForegroundColor Red
    exit 1
}

Push-Location $infrastructureProject
try {
    Write-Host "`nĐang liệt kê migrations..." -ForegroundColor Yellow
    $migrations = dotnet ef migrations list --startup-project ../HiHSK.Api --no-build 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Lỗi khi liệt kê migrations. Đang build project..." -ForegroundColor Yellow
        dotnet build
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Build thất bại!" -ForegroundColor Red
            exit 1
        }
        $migrations = dotnet ef migrations list --startup-project ../HiHSK.Api 2>&1
    }
    
    Write-Host "`nDanh sách migrations:" -ForegroundColor Cyan
    $migrations | ForEach-Object {
        if ($_ -match "^\s*\*\s*(.+)") {
            Write-Host "  ✅ $($matches[1])" -ForegroundColor Green
        }
        elseif ($_ -match "^\s*(.+)") {
            Write-Host "  ⏳ $($matches[1])" -ForegroundColor Yellow
        }
        else {
            Write-Host "  $_" -ForegroundColor Gray
        }
    }
    
    # Kiểm tra migration quan trọng
    Write-Host "`nKiểm tra migrations quan trọng:" -ForegroundColor Cyan
    
    $hasAddLessonTopic = $migrations -match "AddLessonTopicAndExercise"
    $hasSeed12Topics = $migrations -match "Seed12LessonTopicsHsk1"
    
    if ($hasAddLessonTopic) {
        $addLessonTopicIndex = [array]::IndexOf($migrations, ($migrations | Where-Object { $_ -match "AddLessonTopicAndExercise" })[0])
        $seed12TopicsIndex = [array]::IndexOf($migrations, ($migrations | Where-Object { $_ -match "Seed12LessonTopicsHsk1" })[0])
        
        if ($seed12TopicsIndex -lt $addLessonTopicIndex) {
            Write-Host "  ⚠️  CẢNH BÁO: Migration Seed12LessonTopicsHsk1 có thể chạy TRƯỚC AddLessonTopicAndExercise!" -ForegroundColor Red
            Write-Host "     Điều này sẽ gây lỗi 'Invalid object name LessonTopics'" -ForegroundColor Red
            Write-Host "`n  Giải pháp:" -ForegroundColor Yellow
            Write-Host "     1. Xem file: Backend/src/HiHSK.Infrastructure/Migrations/MIGRATION_ANALYSIS.md" -ForegroundColor Cyan
            Write-Host "     2. Apply migrations theo thứ tự thủ công hoặc đổi tên migration" -ForegroundColor Cyan
        }
        else {
            Write-Host "  ✅ Thứ tự migrations đúng" -ForegroundColor Green
        }
    }
    
    # Kiểm tra bảng LessonTopics có tồn tại không
    Write-Host "`nKiểm tra bảng LessonTopics trong database..." -ForegroundColor Cyan
    Write-Host "  (Cần kiểm tra trực tiếp trong SQL Server)" -ForegroundColor Gray
    Write-Host "  SQL: SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'LessonTopics'" -ForegroundColor Gray
    
    Write-Host "`nĐể apply tất cả migrations:" -ForegroundColor Yellow
    Write-Host "  dotnet ef database update --startup-project ../HiHSK.Api" -ForegroundColor Cyan
    
}
catch {
    Write-Host "Lỗi: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
finally {
    Pop-Location
}

