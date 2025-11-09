# Script de seed du lieu vao database thong qua API endpoint
# Tac gia: HiHSK Development Team
# Ngay: 2025-01-06

Write-Host "=== SEED DATA QUA API - HiHSK ===" -ForegroundColor Green
Write-Host ""

# API endpoint
$apiUrl = "http://localhost:5075/api/admin"

# Kiem tra Backend API co dang chay khong
Write-Host "Kiem tra Backend API..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$apiUrl/stats" -Method Get -UseBasicParsing -ErrorAction Stop
    Write-Host "[OK] Backend API dang chay" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Backend API khong chay hoac khong truy cap duoc" -ForegroundColor Red
    Write-Host "Vui long khoi dong Backend API truoc:" -ForegroundColor Yellow
    Write-Host "  cd Backend\src\HiHSK.Api" -ForegroundColor White
    Write-Host "  dotnet run" -ForegroundColor White
    exit 1
}

Write-Host ""

# Kiem tra stats hien tai
Write-Host "=== KIEM TRA DU LIEU HIEN TAI ===" -ForegroundColor Cyan
try {
    $stats = Invoke-RestMethod -Uri "$apiUrl/stats" -Method Get
    Write-Host "Course Categories: $($stats.courseCategories)" -ForegroundColor White
    Write-Host "Courses: $($stats.courses)" -ForegroundColor White
    Write-Host "Lessons: $($stats.lessons)" -ForegroundColor White
    Write-Host "Words: $($stats.words)" -ForegroundColor White
    Write-Host "Vocabulary Topics: $($stats.vocabularyTopics)" -ForegroundColor White
    Write-Host ""
    
    if ($stats.courseCategories -gt 0 -and $stats.courses -gt 0 -and $stats.lessons -gt 0) {
        Write-Host "[WARNING] Du lieu da ton tai. Neu muon seed lai, vui long xoa du lieu cu truoc." -ForegroundColor Yellow
        Write-Host ""
        $response = Read-Host "Ban co muon xoa du lieu cu va seed lai? (y/n)"
        if ($response -ne "y" -and $response -ne "Y") {
            Write-Host "Huy seed data." -ForegroundColor Yellow
            exit 0
        }
        
        Write-Host ""
        Write-Host "Dang xoa du lieu cu..." -ForegroundColor Yellow
        try {
            $clearResponse = Invoke-RestMethod -Uri "$apiUrl/clear-data" -Method Post -ErrorAction Stop
            Write-Host "[OK] Da xoa du lieu cu" -ForegroundColor Green
        } catch {
            Write-Host "[ERROR] Loi khi xoa du lieu cu: $($_.Exception.Message)" -ForegroundColor Red
            exit 1
        }
    }
} catch {
    Write-Host "[ERROR] Loi khi kiem tra stats: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Seed du lieu
Write-Host "=== BAT DAU SEED DATA ===" -ForegroundColor Cyan
Write-Host "Dang seed du lieu tu file seed-data-hsk1.json..." -ForegroundColor Yellow
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
    Write-Host ""
    Write-Host "Vui long kiem tra:" -ForegroundColor Yellow
    Write-Host "  1. File seed-data-hsk1.json co ton tai trong Backend/data/ khong" -ForegroundColor White
    Write-Host "  2. Backend API co quyen truy cap file khong" -ForegroundColor White
    Write-Host "  3. Xem logs cua Backend API de biet loi chi tiet" -ForegroundColor White
    exit 1
}

Write-Host ""

# Seed Vocabulary Topic
Write-Host "=== SEED VOCABULARY TOPIC HSK1 ===" -ForegroundColor Cyan
Write-Host "Dang seed Vocabulary Topic HSK1..." -ForegroundColor Yellow
Write-Host ""

try {
    $vocabResponse = Invoke-RestMethod -Uri "$apiUrl/seed-vocabulary-topic-hsk1" -Method Post -ErrorAction Stop
    Write-Host "[OK] Da seed Vocabulary Topic HSK1" -ForegroundColor Green
    Write-Host "  - Vocabulary Topic ID: $($vocabResponse.vocabularyTopicId)" -ForegroundColor White
    Write-Host "  - So tu vung da gan: $($vocabResponse.addedWords)" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "[WARNING] Loi khi seed Vocabulary Topic (co the da ton tai): $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host ""
}

# Kiem tra ket qua cuoi cung
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
        Write-Host "=== SEED DATA HOAN TAT THANH CONG ===" -ForegroundColor Green
        Write-Host ""
        Write-Host "Ban co the:" -ForegroundColor Yellow
        Write-Host "  1. Truy cap trang vocabulary: http://localhost:3000/vocabulary/1" -ForegroundColor White
        Write-Host "  2. Truy cap trang lesson: http://localhost:3000/lessons/1" -ForegroundColor White
        Write-Host "  3. Kiem tra API: http://localhost:5075/api/admin/stats" -ForegroundColor White
    } else {
        Write-Host "[WARNING] Co the du lieu chua duoc seed day du. Vui long kiem tra lai." -ForegroundColor Yellow
    }
} catch {
    Write-Host "[ERROR] Loi khi kiem tra ket qua: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== HOAN TAT ===" -ForegroundColor Green
