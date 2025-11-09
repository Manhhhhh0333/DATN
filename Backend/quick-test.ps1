# Quick test - Kiểm tra nhanh API
Write-Host "Kiểm tra Backend có đang chạy..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5075/api/test" -Method Get
    Write-Host "✓ Backend đang chạy!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Backend không chạy hoặc không truy cập được!" -ForegroundColor Red
    Write-Host "Hãy chạy: cd Backend/src/HiHSK.Api && dotnet run" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Để test API Generate Examples, hãy:" -ForegroundColor Cyan
Write-Host "1. Mở Swagger: http://localhost:5075/swagger" -ForegroundColor White
Write-Host "2. Đăng nhập tại POST /api/auth/login để lấy token" -ForegroundColor White
Write-Host "3. Click 'Authorize' và nhập: Bearer YOUR_TOKEN" -ForegroundColor White
Write-Host "4. Test API tại POST /api/ai/generate-example" -ForegroundColor White
Write-Host ""
Write-Host "Hoặc chạy: .\test-gemini-api.ps1" -ForegroundColor Cyan

