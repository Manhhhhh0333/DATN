# Script test API Generate Examples với Gemini
# Sử dụng: .\test-gemini-api.ps1
#
# Lưu ý: 
# 1. Đảm bảo Backend đang chạy tại http://localhost:5075
# 2. Thay email và password bằng thông tin đăng nhập của bạn
# 3. Đảm bảo đã cấu hình Gemini API Key trong appsettings.json

$baseUrl = "http://localhost:5075"
$email = "test@example.com"  # THAY BẰNG EMAIL CỦA BẠN
$password = "Password123!"    # THAY BẰNG PASSWORD CỦA BẠN
$testWord = "你好"            # Từ vựng cần test

Write-Host "=== TEST API GEMINI GENERATE EXAMPLES ===" -ForegroundColor Green
Write-Host ""

# Bước 1: Đăng nhập để lấy token
Write-Host "Bước 1: Đăng nhập..." -ForegroundColor Yellow
$loginBody = @{
    email = $email
    password = $password
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $loginBody
    
    $token = $loginResponse.token
    Write-Host "✓ Đăng nhập thành công!" -ForegroundColor Green
    Write-Host "Token: $($token.Substring(0, 50))..." -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Lỗi đăng nhập: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Chi tiết: $($_.Exception.Response)" -ForegroundColor Red
    exit 1
}

# Bước 2: Test API Generate Examples
Write-Host "Bước 2: Test API Generate Examples..." -ForegroundColor Yellow
$testWord = "你好"
$generateBody = @{
    word = $testWord
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    Write-Host "Gửi request: POST $baseUrl/api/ai/generate-example" -ForegroundColor Gray
    Write-Host "Body: $generateBody" -ForegroundColor Gray
    Write-Host ""
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/ai/generate-example" `
        -Method Post `
        -Headers $headers `
        -Body $generateBody
    
    Write-Host "✓ API trả về thành công!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Kết quả:" -ForegroundColor Cyan
    Write-Host "  Từ vựng: $($response.word)" -ForegroundColor White
    Write-Host "  Số lượng ví dụ: $($response.count)" -ForegroundColor White
    Write-Host ""
    Write-Host "Danh sách ví dụ:" -ForegroundColor Cyan
    foreach ($example in $response.examples) {
        Write-Host "  [$($example.sortOrder)] $($example.character) ($($example.pinyin)) - $($example.meaning)" -ForegroundColor White
    }
    Write-Host ""
    Write-Host "=== TEST THÀNH CÔNG ===" -ForegroundColor Green
} catch {
    Write-Host "✗ Lỗi khi gọi API: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Chi tiết lỗi: $responseBody" -ForegroundColor Red
    }
    exit 1
}

