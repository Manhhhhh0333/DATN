# Script don gian de seed du lieu (khong xoa du lieu cu)
# Script nay se seed du lieu ma khong xoa, vi DataSeeder da co check IF NOT EXISTS

Write-Host "=== SEED DATA DON GIAN - HiHSK ===" -ForegroundColor Green
Write-Host ""

# API endpoint
$apiUrl = "http://localhost:5075/api/admin"

# Kiem tra Backend API
Write-Host "Kiem tra Backend API..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$apiUrl/stats" -Method Get -UseBasicParsing -ErrorAction Stop -TimeoutSec 2
    Write-Host "[OK] Backend API dang chay" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Backend API khong chay" -ForegroundColor Red
    Write-Host "Vui long khoi dong Backend API:" -ForegroundColor Yellow
    Write-Host "  cd Backend\src\HiHSK.Api" -ForegroundColor White
    Write-Host "  dotnet run" -ForegroundColor White
    exit 1
}

Write-Host ""

# Kiem tra du lieu hien tai
Write-Host "=== KIEM TRA DU LIEU HIEN TAI ===" -ForegroundColor Cyan
try {
    $stats = Invoke-RestMethod -Uri "$apiUrl/stats" -Method Get
    Write-Host "Course Categories: $($stats.courseCategories)" -ForegroundColor White
    Write-Host "Courses: $($stats.courses)" -ForegroundColor White
    Write-Host "Lessons: $($stats.lessons)" -ForegroundColor White
    Write-Host "Words: $($stats.words)" -ForegroundColor White
    Write-Host "Vocabulary Topics: $($stats.vocabularyTopics)" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "[ERROR] Loi khi kiem tra stats: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Seed du lieu (khong xoa du lieu cu)
Write-Host "=== BAT DAU SEED DATA ===" -ForegroundColor Cyan
Write-Host "Luu y: Script nay se chi seed du lieu moi, khong xoa du lieu cu." -ForegroundColor Yellow
Write-Host "DataSeeder se tu dong bo qua cac ban ghi da ton tai." -ForegroundColor Yellow
Write-Host ""

try {
    $seedResponse = Invoke-RestMethod -Uri "$apiUrl/seed?fileName=seed-data-hsk1.json" -Method Post -ErrorAction Stop
    
    Write-Host "=== SEED DATA THANH CONG ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Du lieu da duoc seed:" -ForegroundColor Green
    Write-Host "  - Course Categories: $($seedResponse.stats.courseCategories)" -ForegroundColor White
    Write-Host "  - Courses: $($seedResponse.stats.courses)" -ForegroundColor White
    Write-Host "  - Lessons: $($seedResponse.stats.lessons)" -ForegroundColor White
    Write-Host "  - Words: $($seedResponse.stats.words)" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host ""
    Write-Host "=== LOI KHI SEED DATA ===" -ForegroundColor Red
    try {
        $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
        if ($errorDetails) {
            Write-Host "Loi: $($errorDetails.message)" -ForegroundColor Red
            if ($errorDetails.error) {
                Write-Host "Chi tiet: $($errorDetails.error)" -ForegroundColor Yellow
            }
        } else {
            Write-Host "Loi: $($_.Exception.Message)" -ForegroundColor Red
        }
    } catch {
        Write-Host "Loi: $($_.Exception.Message)" -ForegroundColor Red
    }
    exit 1
}

# Seed Vocabulary Topic
Write-Host "=== SEED VOCABULARY TOPIC HSK1 ===" -ForegroundColor Cyan
try {
    $vocabResponse = Invoke-RestMethod -Uri "$apiUrl/seed-vocabulary-topic-hsk1" -Method Post -ErrorAction Stop
    Write-Host "[OK] Da seed Vocabulary Topic HSK1" -ForegroundColor Green
    Write-Host "  - Vocabulary Topic ID: $($vocabResponse.vocabularyTopicId)" -ForegroundColor White
    Write-Host "  - So tu vung da gan: $($vocabResponse.addedWords)" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "[WARNING] Loi khi seed Vocabulary Topic: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host ""
}

# Kiem tra ket qua
Write-Host "=== KET QUA CUOI CUNG ===" -ForegroundColor Cyan
try {
    $finalStats = Invoke-RestMethod -Uri "$apiUrl/stats" -Method Get
    Write-Host "Course Categories: $($finalStats.courseCategories)" -ForegroundColor White
    Write-Host "Courses: $($finalStats.courses)" -ForegroundColor White
    Write-Host "Lessons: $($finalStats.lessons)" -ForegroundColor White
    Write-Host "Words: $($finalStats.words)" -ForegroundColor White
    Write-Host "Vocabulary Topics: $($finalStats.vocabularyTopics)" -ForegroundColor White
    Write-Host ""
    
    if ($finalStats.courseCategories -gt 0 -and $finalStats.courses -gt 0 -and $finalStats.lessons -gt 0 -and $finalStats.words -gt 0) {
        Write-Host "=== HOAN TAT ===" -ForegroundColor Green
        Write-Host ""
        Write-Host "Ban co the:" -ForegroundColor Yellow
        Write-Host "  1. Truy cap: http://localhost:3000/vocabulary/1" -ForegroundColor White
        Write-Host "  2. Truy cap: http://localhost:3000/lessons/1" -ForegroundColor White
    } else {
        Write-Host "[WARNING] Du lieu chua du day du" -ForegroundColor Yellow
    }
} catch {
    Write-Host "[ERROR] Loi khi kiem tra ket qua: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

