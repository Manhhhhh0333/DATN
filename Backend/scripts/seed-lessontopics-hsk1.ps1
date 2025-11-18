[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$sqlFile = Join-Path $scriptPath "seed-12-topics-hsk1.sql"

Write-Host "Seed 12 LessonTopics cho HSK1..." -ForegroundColor Green

if (-not (Test-Path $sqlFile)) {
    Write-Host "Loi: Khong tim thay file SQL tai $sqlFile" -ForegroundColor Red
    exit 1
}

Write-Host "`nFile SQL: $sqlFile" -ForegroundColor Cyan
Write-Host ""
Write-Host "Cach 1: Chay qua SQL Server Management Studio (Khuyến nghị)" -ForegroundColor Yellow
Write-Host "  1. Mo SQL Server Management Studio" -ForegroundColor White
Write-Host "  2. Connect to database HIHSK" -ForegroundColor White
Write-Host "  3. Mo file: $sqlFile" -ForegroundColor White
Write-Host "  4. Execute (F5)" -ForegroundColor White
Write-Host ""
Write-Host "Cach 2: Chay qua sqlcmd (neu co)" -ForegroundColor Yellow
Write-Host "  sqlcmd -S localhost -d HIHSK -i `"$sqlFile`"" -ForegroundColor White
Write-Host ""
Write-Host "Cach 3: Copy SQL va chay trong SSMS" -ForegroundColor Yellow
Write-Host "  Mo file SQL, copy toan bo noi dung, paste vao SSMS va Execute" -ForegroundColor White
Write-Host ""
Write-Host "Sau khi seed, kiem tra:" -ForegroundColor Cyan
Write-Host "  SELECT COUNT(*) FROM LessonTopics WHERE HSKLevel = 1" -ForegroundColor Gray
Write-Host "  (Phai co 12 topics)" -ForegroundColor Gray

