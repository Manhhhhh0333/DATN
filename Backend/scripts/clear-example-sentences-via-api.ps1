# Script để cap nhat ExampleSentence thanh NULL thong qua API
# Tac gia: HiHSK Development Team
# Ngay: 2025-01-09

# Set encoding to UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "=== CAP NHAT ExampleSentence THANH RONG (QUA API) ===" -ForegroundColor Green
Write-Host ""

# Cau hinh
$apiBaseUrl = "http://localhost:5075"
$endpoint = "$apiBaseUrl/api/admin/clear-example-sentences"

# Kiem tra xem API co dang chay khong
Write-Host "Dang kiem tra ket noi den API..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$apiBaseUrl/api/admin/stats" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "[OK] API dang chay tai $apiBaseUrl" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Khong the ket noi den API tai $apiBaseUrl" -ForegroundColor Red
    Write-Host "Vui long dam bao Backend API dang chay." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "De chay Backend API:" -ForegroundColor Yellow
    Write-Host "  cd Backend/src/HiHSK.Api" -ForegroundColor White
    Write-Host "  dotnet run" -ForegroundColor White
    exit 1
}

Write-Host ""

# Xac nhan tu nguoi dung
Write-Host "Ban co chac chan muon cap nhat tat ca ExampleSentence thanh NULL?" -ForegroundColor Yellow
$confirm = Read-Host "Nhap 'y' de tiep tuc hoac phim bat ky de huy"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "Da huy thao tac." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "=== BAT DAU CAP NHAT ===" -ForegroundColor Cyan
Write-Host ""

try {
    # Goi API endpoint
    Write-Host "Dang goi API endpoint..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri $endpoint -Method POST -ContentType "application/json" -ErrorAction Stop
    
    Write-Host ""
    Write-Host "[OK] Cap nhat thanh cong!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Ket qua:" -ForegroundColor Cyan
    Write-Host "  Message: $($response.message)" -ForegroundColor White
    Write-Host "  So ban ghi da cap nhat: $($response.updatedCount)" -ForegroundColor White
    Write-Host "  So ban ghi truoc khi update: $($response.countBefore)" -ForegroundColor White
    Write-Host "  So ban ghi sau khi update: $($response.countAfter)" -ForegroundColor White
    Write-Host ""
    Write-Host "Thong ke:" -ForegroundColor Cyan
    Write-Host "  Tong so tu vung: $($response.stats.totalWords)" -ForegroundColor White
    Write-Host "  Tu vung co ExampleSentence rong: $($response.stats.wordsWithEmptyExample)" -ForegroundColor White
    Write-Host "  Tu vung co ExampleSentence: $($response.stats.wordsWithExample)" -ForegroundColor White
    
} catch {
    Write-Host ""
    Write-Host "[ERROR] Co loi xay ra:" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host $responseBody -ForegroundColor Red
    } else {
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
    exit 1
}

Write-Host ""
Write-Host "=== HOAN THANH ===" -ForegroundColor Green

