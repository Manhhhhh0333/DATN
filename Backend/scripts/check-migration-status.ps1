[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Split-Path -Parent $scriptPath
$infrastructureProject = Join-Path $backendPath "src\HiHSK.Infrastructure"

Write-Host "Kiem tra trang thai migrations..." -ForegroundColor Green

if (-not (Test-Path $infrastructureProject)) {
    Write-Host "Loi: Khong tim thay project tai $infrastructureProject" -ForegroundColor Red
    exit 1
}

Push-Location $infrastructureProject
try {
    Write-Host "`nDanh sach migrations va trang thai:" -ForegroundColor Yellow
    dotnet ef migrations list --startup-project ../HiHSK.Api
    
    Write-Host "`nDe apply tat ca migrations tu dau:" -ForegroundColor Cyan
    Write-Host "  dotnet ef database update --startup-project ../HiHSK.Api" -ForegroundColor White
    
    Write-Host "`nDe xoa database va tao lai:" -ForegroundColor Cyan
    Write-Host "  dotnet ef database drop --startup-project ../HiHSK.Api --force" -ForegroundColor White
    Write-Host "  dotnet ef database update --startup-project ../HiHSK.Api" -ForegroundColor White
}
catch {
    Write-Host "Loi: $($_.Exception.Message)" -ForegroundColor Red
}
finally {
    Pop-Location
}

