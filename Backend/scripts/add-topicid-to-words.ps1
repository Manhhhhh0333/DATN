$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$pythonScript = Join-Path $scriptPath "classify-words-to-topics.py"

Write-Host "Dang phan loai tu vung va them topicId vao JSON..." -ForegroundColor Gray

try {
    python $pythonScript
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Da them topicId vao tat ca tu vung trong seed-data-hsk1.json" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Loi khi chay Python script" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "[ERROR] Loi: $_" -ForegroundColor Red
    exit 1
}

