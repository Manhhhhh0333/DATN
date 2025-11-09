# Script để seed dữ liệu vào database thông qua API
# Tác giả: HiHSK Development Team

Write-Host "=== SEED DATA - HiHSK ===" -ForegroundColor Green
Write-Host ""

# Cấu hình
$apiBaseUrl = "http://localhost:5075"
$seedEndpoint = "$apiBaseUrl/api/admin/seed"

# Kiểm tra xem API có đang chạy không
Write-Host "Đang kiểm tra kết nối đến API..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$apiBaseUrl/api/admin/stats" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✓ API đang chạy tại $apiBaseUrl" -ForegroundColor Green
} catch {
    Write-Host "✗ Không thể kết nối đến API tại $apiBaseUrl" -ForegroundColor Red
    Write-Host "Vui lòng đảm bảo Backend API đang chạy." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Để chạy Backend API:" -ForegroundColor Yellow
    Write-Host "  cd Backend/src/HiHSK.Api" -ForegroundColor White
    Write-Host "  dotnet run" -ForegroundColor White
    exit 1
}

Write-Host ""

# Seed dữ liệu HSK1
Write-Host "=== BẮT ĐẦU SEED DỮ LIỆU HSK1 ===" -ForegroundColor Cyan
Write-Host ""

try {
    # Gọi API seed data
    $seedUrl = "$seedEndpoint?fileName=seed-data-hsk1.json&clearExisting=false"
    Write-Host "Đang gọi API: $seedUrl" -ForegroundColor Yellow
    
    $response = Invoke-RestMethod -Uri $seedUrl -Method POST -ContentType "application/json" -ErrorAction Stop
    
    Write-Host ""
    Write-Host "=== SEED DATA THÀNH CÔNG ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Thống kê dữ liệu đã seed:" -ForegroundColor Green
    Write-Host "  - Course Categories: $($response.stats.courseCategories)" -ForegroundColor White
    Write-Host "  - Courses: $($response.stats.courses)" -ForegroundColor White
    Write-Host "  - Lessons: $($response.stats.lessons)" -ForegroundColor White
    Write-Host "  - Words: $($response.stats.words)" -ForegroundColor White
    Write-Host "  - Questions: $($response.stats.questions)" -ForegroundColor White
    Write-Host ""
    
    # Seed Vocabulary Topic HSK1
    Write-Host "=== SEED VOCABULARY TOPIC HSK1 ===" -ForegroundColor Cyan
    Write-Host ""
    
    $vocabTopicUrl = "$apiBaseUrl/api/admin/seed-vocabulary-topic-hsk1"
    Write-Host "Đang gọi API: $vocabTopicUrl" -ForegroundColor Yellow
    
    try {
        $vocabResponse = Invoke-RestMethod -Uri $vocabTopicUrl -Method POST -ContentType "application/json" -ErrorAction Stop
        Write-Host ""
        Write-Host "✓ $($vocabResponse.message)" -ForegroundColor Green
        if ($vocabResponse.stats) {
            Write-Host "  - Vocabulary Topics: $($vocabResponse.stats.vocabularyTopics)" -ForegroundColor White
            Write-Host "  - Words Linked: $($vocabResponse.stats.wordsLinked)" -ForegroundColor White
        }
    } catch {
        Write-Host ""
        Write-Host "⚠ Có lỗi khi seed Vocabulary Topic:" -ForegroundColor Yellow
        Write-Host $_.Exception.Message -ForegroundColor Yellow
        Write-Host "Có thể Vocabulary Topic đã được seed trước đó." -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "=== HOÀN TẤT ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Bạn có thể kiểm tra dữ liệu bằng cách:" -ForegroundColor Yellow
    Write-Host "  1. Mở trang: http://localhost:3000/courses" -ForegroundColor White
    Write-Host "  2. Mở trang: http://localhost:3000/hsk-vocabulary/1/part/1" -ForegroundColor White
    Write-Host "  3. Gọi API: $apiBaseUrl/api/admin/stats" -ForegroundColor White
    
} catch {
    Write-Host ""
    Write-Host "=== LỖI KHI SEED DATA ===" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Chi tiết lỗi:" -ForegroundColor Yellow
        Write-Host $responseBody -ForegroundColor Red
    }
    
    exit 1
}

Write-Host ""

