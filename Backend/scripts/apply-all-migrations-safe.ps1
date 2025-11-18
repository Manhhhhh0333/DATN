[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Split-Path -Parent $scriptPath
$infrastructureProject = Join-Path $backendPath "src\HiHSK.Infrastructure"

Write-Host "Apply tat ca migrations (an toan)..." -ForegroundColor Green

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
    
    Write-Host "`nBuoc 3: Apply tat ca migrations..." -ForegroundColor Yellow
    Write-Host "  (Migration Down() da duoc sua de kiem tra ton tai truoc khi drop)" -ForegroundColor Gray
    
    dotnet ef database update --startup-project ../HiHSK.Api
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Da apply migrations thanh cong!" -ForegroundColor Green
        
        Write-Host "`nBuoc 4: Kiem tra bang LessonTopics..." -ForegroundColor Yellow
        Write-Host "  SQL: SELECT COUNT(*) FROM LessonTopics WHERE HSKLevel = 1" -ForegroundColor Gray
        
        Write-Host "`nBuoc 5: Neu chua co 12 topics, chay SQL seed:" -ForegroundColor Yellow
        Write-Host "  File: Backend/scripts/seed-12-topics-hsk1.sql" -ForegroundColor Cyan
    }
    else {
        Write-Host "`n❌ Co loi khi apply migrations!" -ForegroundColor Red
        Write-Host "`nThu cach khac: Xoa database va tao lai tu dau" -ForegroundColor Yellow
        Write-Host "  dotnet ef database drop --startup-project ../HiHSK.Api --force" -ForegroundColor Cyan
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

