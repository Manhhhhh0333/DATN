[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Split-Path -Parent $scriptPath
$infrastructureProject = Join-Path $backendPath "src\HiHSK.Infrastructure"
$apiProject = Join-Path $backendPath "src\HiHSK.Api"

Write-Host "Kiểm tra và cập nhật database..." -ForegroundColor Green

if (-not (Test-Path $infrastructureProject)) {
    Write-Host "Lỗi: Không tìm thấy project tại $infrastructureProject" -ForegroundColor Red
    exit 1
}

Push-Location $infrastructureProject
try {
    Write-Host "`nĐang kiểm tra migrations chưa được apply..." -ForegroundColor Yellow
    $pendingMigrations = dotnet ef migrations list --startup-project ../HiHSK.Api --no-build 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Lỗi khi kiểm tra migrations. Đang build project..." -ForegroundColor Yellow
        dotnet build
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Build thất bại!" -ForegroundColor Red
            exit 1
        }
    }
    
    Write-Host "`nĐang apply migrations..." -ForegroundColor Cyan
    dotnet ef database update --startup-project ../HiHSK.Api
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`nDatabase đã được cập nhật thành công!" -ForegroundColor Green
    }
    else {
        Write-Host "`nCó lỗi khi cập nhật database!" -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "Lỗi: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
finally {
    Pop-Location
}

