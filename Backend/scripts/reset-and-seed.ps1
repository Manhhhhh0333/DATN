$ErrorActionPreference = "Stop"

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Reset Database + Seed Data           " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/2] Reset database..." -ForegroundColor Yellow
& "$scriptPath\reset-database.ps1"

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Loi khi reset database. Dung lai." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[2/2] Seed data cho LessonTopics HSK1..." -ForegroundColor Yellow

$seedScriptPath = Join-Path $scriptPath "seed-12-topics-hsk1.sql"
$databaseName = "HIHSK"
$serverName = "localhost"

if (-not (Test-Path $seedScriptPath)) {
    Write-Host "  ✗ Khong tim thay file: $seedScriptPath" -ForegroundColor Red
    exit 1
}

try {
    $seedScript = Get-Content $seedScriptPath -Raw -Encoding UTF8
    
    $connectionString = "Server=$serverName;Database=$databaseName;Trusted_Connection=True;TrustServerCertificate=True;"
    $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
    $connection.Open()
    $command = $connection.CreateCommand()
    $command.CommandText = $seedScript
    $command.CommandTimeout = 60
    
    Write-Host "  Dang chay seed script..." -ForegroundColor Gray
    $command.ExecuteNonQuery() | Out-Null
    $connection.Close()
    
    Write-Host "  [OK] Seed data thanh cong" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] Loi khi seed data: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  [OK] Hoan thanh! Database da duoc reset" -ForegroundColor Green
Write-Host "     va seed 12 topics cho HSK1" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

