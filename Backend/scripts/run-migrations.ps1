# Script de chay migrations
# Su dung: .\run-migrations.ps1

Write-Host "Dang chay migrations..." -ForegroundColor Yellow

# Lay thu muc goc cua project (2 cap len tu scripts)
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent (Split-Path -Parent $scriptPath)
$apiPath = Join-Path $projectRoot "Backend\src\HiHSK.Api"

cd $apiPath

try {
    dotnet ef database update --project ..\HiHSK.Infrastructure
    
    Write-Host "`nMigrations da chay thanh cong!" -ForegroundColor Green
    Write-Host "Bay gio ban co the seed Vocabulary Topic:" -ForegroundColor Cyan
    Write-Host "cd Backend/scripts" -ForegroundColor Cyan
    Write-Host ".\seed-vocabulary-topic.ps1" -ForegroundColor Cyan
}
catch {
    Write-Host "`nLoi khi chay migrations:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

