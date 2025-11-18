$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$pythonScript = Join-Path $scriptPath "classify-words-to-topics.py"

Write-Host "Dang phan loai tu vung va them topicId vao JSON..." -ForegroundColor Gray
Write-Host "Su dung Python script de xu ly Unicode..." -ForegroundColor Gray

try {
    $result = python $pythonScript 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host $result
        Write-Host "[OK] Da them topicId vao tat ca tu vung trong seed-data-hsk1.json" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Loi khi chay Python script:" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "[ERROR] Loi: $_" -ForegroundColor Red
    Write-Host "Vui long kiem tra Python da duoc cai dat chua" -ForegroundColor Yellow
    exit 1
}
