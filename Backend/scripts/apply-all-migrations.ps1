[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Split-Path -Parent $scriptPath
$infrastructureProject = Join-Path $backendPath "src\HiHSK.Infrastructure"

Write-Host "Apply tat ca migrations..." -ForegroundColor Green

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
    
    Write-Host "`nBuoc 2: Apply tat ca migrations..." -ForegroundColor Yellow
    Write-Host "  (Migration seed se bo qua neu bang chua ton tai)" -ForegroundColor Gray
    
    dotnet ef database update --startup-project ../HiHSK.Api
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Da apply migrations thanh cong!" -ForegroundColor Green
        
        Write-Host "`nBuoc 3: Kiem tra bang LessonTopics..." -ForegroundColor Yellow
        Write-Host "  SQL: SELECT COUNT(*) FROM LessonTopics WHERE HSKLevel = 1" -ForegroundColor Gray
        
        Write-Host "`nBuoc 4: Neu chua co 12 topics, chay SQL seed:" -ForegroundColor Yellow
        Write-Host "  File: Backend/scripts/seed-12-topics-hsk1.sql" -ForegroundColor Cyan
    }
    else {
        Write-Host "`n❌ Co loi khi apply migrations!" -ForegroundColor Red
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

