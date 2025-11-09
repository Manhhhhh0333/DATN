# Script nhanh de seed du lieu vao database
# Tac gia: HiHSK Development Team

$apiUrl = "http://localhost:5075/api/admin"

Write-Host "=== QUICK SEED DATA ===" -ForegroundColor Green
Write-Host ""

# Kiem tra API
Write-Host "Dang kiem tra API..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$apiUrl/stats" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "API dang chay" -ForegroundColor Green
} catch {
    Write-Host "API khong chay. Vui long khoi dong Backend API truoc." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Seed du lieu chinh
Write-Host "Dang seed du lieu HSK1..." -ForegroundColor Yellow
try {
    $seedUri = "$apiUrl/seed" + "?fileName=seed-data-hsk1.json" + "&clearExisting=false"
    $seedResponse = Invoke-RestMethod -Uri $seedUri -Method POST -ErrorAction Stop
    Write-Host "Seed du lieu thanh cong!" -ForegroundColor Green
    Write-Host "  - Course Categories: $($seedResponse.stats.courseCategories)" -ForegroundColor White
    Write-Host "  - Courses: $($seedResponse.stats.courses)" -ForegroundColor White
    Write-Host "  - Lessons: $($seedResponse.stats.lessons)" -ForegroundColor White
    Write-Host "  - Words: $($seedResponse.stats.words)" -ForegroundColor White
    Write-Host "  - Questions: $($seedResponse.stats.questions)" -ForegroundColor White
} catch {
    Write-Host "Loi khi seed du lieu: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host $responseBody -ForegroundColor Yellow
    }
    exit 1
}

Write-Host ""

# Seed Vocabulary Topic
Write-Host "Dang seed Vocabulary Topic HSK1..." -ForegroundColor Yellow
try {
    $vocabResponse = Invoke-RestMethod -Uri "$apiUrl/seed-vocabulary-topic-hsk1" -Method POST -ErrorAction Stop
    Write-Host "Seed Vocabulary Topic thanh cong!" -ForegroundColor Green
} catch {
    Write-Host "Vocabulary Topic co the da ton tai hoac co loi: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== HOAN TAT ===" -ForegroundColor Green
Write-Host "Ban co the truy cap: http://localhost:3000/hsk-vocabulary/1/part/1" -ForegroundColor Cyan

