[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Stop"

$baseUrl = "http://localhost:5075"
$endpoint = "$baseUrl/api/admin/lessontopics/auto-organize-hsk1"

Write-Host "Bắt đầu phân loại 150 từ vựng HSK1 vào 12 chủ đề..." -ForegroundColor Green
Write-Host "Đang kiểm tra kết nối đến $baseUrl..." -ForegroundColor Yellow

try {
    $testResponse = Invoke-WebRequest -Uri "$baseUrl/api/admin/stats" -Method Get -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    Write-Host "Kết nối thành công!" -ForegroundColor Green
}
catch {
    Write-Host "Lỗi: Không thể kết nối đến backend tại $baseUrl" -ForegroundColor Red
    Write-Host "Vui lòng đảm bảo backend API đang chạy." -ForegroundColor Yellow
    Write-Host "Chi tiết: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "Đang gọi API phân loại từ vựng..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri $endpoint -Method Post -ContentType "application/json" -TimeoutSec 60
    
    Write-Host "`nKết quả phân loại:" -ForegroundColor Cyan
    Write-Host "Tổng số từ vựng: $($response.totalWords)" -ForegroundColor Yellow
    Write-Host "Đã phân loại: $($response.classifiedWords)" -ForegroundColor Yellow
    Write-Host "Chưa phân loại: $($response.unclassifiedWords)" -ForegroundColor Yellow
    Write-Host "Số chủ đề: $($response.topics.Count)" -ForegroundColor Yellow
    Write-Host "`nThông báo: $($response.message)" -ForegroundColor Green
    
    if ($response.topics -and $response.topics.Count -gt 0) {
        Write-Host "`nChi tiết từng chủ đề:" -ForegroundColor Cyan
        foreach ($topic in $response.topics) {
            Write-Host "  - $($topic.title): $($topic.wordCount) từ vựng" -ForegroundColor White
        }
    }
    
    Write-Host "`nHoàn thành!" -ForegroundColor Green
}
catch {
    Write-Host "`nLỗi khi gọi API:" -ForegroundColor Red
    Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "  Status Code: $statusCode" -ForegroundColor Red
        
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "  Response: $responseBody" -ForegroundColor Red
        }
        catch {
            Write-Host "  Không thể đọc response body" -ForegroundColor Yellow
        }
    }
    
    if ($_.ErrorDetails) {
        Write-Host "  Chi tiết: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    
    exit 1
}

