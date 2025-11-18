[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Split-Path -Parent $scriptPath
$sqlFile = Join-Path $scriptPath "seed-12-topics-hsk1.sql"

Write-Host "Kiem tra va seed 12 topics cho HSK1..." -ForegroundColor Green

Write-Host "`nBuoc 1: Kiem tra bang LessonTopics co du lieu chua..." -ForegroundColor Yellow
Write-Host "  SQL: SELECT COUNT(*) FROM LessonTopics WHERE HSKLevel = 1" -ForegroundColor Gray

Write-Host "`nBuoc 2: Neu chua co du lieu, chay SQL seed:" -ForegroundColor Yellow
Write-Host "  File: $sqlFile" -ForegroundColor Cyan
Write-Host ""
Write-Host "Cach 1: Chay qua SQL Server Management Studio" -ForegroundColor White
Write-Host "  1. Mo SQL Server Management Studio" -ForegroundColor Gray
Write-Host "  2. Connect to database HIHSK" -ForegroundColor Gray
Write-Host "  3. Mo file: $sqlFile" -ForegroundColor Gray
Write-Host "  4. Execute (F5)" -ForegroundColor Gray
Write-Host ""
Write-Host "Cach 2: Chay qua sqlcmd (neu co)" -ForegroundColor White
Write-Host "  sqlcmd -S localhost -d HIHSK -i `"$sqlFile`"" -ForegroundColor Gray
Write-Host ""
Write-Host "Cach 3: Chay qua migration (neu da co Designer.cs)" -ForegroundColor White
Write-Host "  cd Backend/src/HiHSK.Infrastructure" -ForegroundColor Gray
Write-Host "  dotnet ef database update 20250116000000_Seed12LessonTopicsHsk1 --startup-project ../HiHSK.Api" -ForegroundColor Gray

Write-Host "`nBuoc 3: Sau khi seed, kiem tra lai:" -ForegroundColor Yellow
Write-Host "  SQL: SELECT Id, Title, TopicIndex FROM LessonTopics WHERE HSKLevel = 1 ORDER BY TopicIndex" -ForegroundColor Gray

