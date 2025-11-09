# Script để seed dữ liệu vào database thông qua migration
# Tác giả: HiHSK Development Team
# Ngày: 2025-01-06

Write-Host "=== SEED DATABASE - HiHSK ===" -ForegroundColor Green
Write-Host ""

# Kiểm tra vị trí file seed data
$seedDataPath = "..\data\seed-data-hsk1.json"
$fullPath = Join-Path $PSScriptRoot $seedDataPath

if (-not (Test-Path $fullPath)) {
    Write-Host "ERROR: Khong tim thay file seed data: $fullPath" -ForegroundColor Red
    Write-Host "Vui long kiem tra duong dan file." -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Tim thay file seed data: $fullPath" -ForegroundColor Green
Write-Host ""

# Di chuyen den thu muc Backend API
$apiPath = Join-Path $PSScriptRoot "..\src\HiHSK.Api"
if (-not (Test-Path $apiPath)) {
    Write-Host "ERROR: Khong tim thay thu muc Backend API: $apiPath" -ForegroundColor Red
    exit 1
}

Set-Location $apiPath
Write-Host "✓ Da di chuyen den: $apiPath" -ForegroundColor Green
Write-Host ""

# Kiem tra xem Backend API co dang chay khong
Write-Host "Kiem tra Backend API..." -ForegroundColor Yellow
$apiProcess = Get-Process | Where-Object { $_.ProcessName -like "*HiHSK.Api*" -or $_.CommandLine -like "*HiHSK.Api*" }
if ($apiProcess) {
    Write-Host "WARNING: Backend API co the dang chay. Neu gap loi 'file locked', vui long dung Backend API truoc." -ForegroundColor Yellow
    Write-Host ""
}

# Chay migration
Write-Host "=== BAT DAU SEED DATA ===" -ForegroundColor Cyan
Write-Host ""

try {
    # Chay migration de seed data
    Write-Host "Dang chay migration..." -ForegroundColor Yellow
    dotnet ef database update --project ..\HiHSK.Infrastructure
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "=== SEED DATA THANH CONG ===" -ForegroundColor Green
        Write-Host ""
        Write-Host "Du lieu da duoc seed vao database:" -ForegroundColor Green
        Write-Host "  - Course Categories" -ForegroundColor White
        Write-Host "  - Courses" -ForegroundColor White
        Write-Host "  - Lessons (13 bai hoc)" -ForegroundColor White
        Write-Host "  - Words (150 tu vung HSK1)" -ForegroundColor White
        Write-Host "  - Vocabulary Topic HSK1" -ForegroundColor White
        Write-Host "  - Word-Vocabulary Topic Links" -ForegroundColor White
        Write-Host ""
        Write-Host "Ban co the kiem tra bang cach:" -ForegroundColor Yellow
        Write-Host "  1. Mo trang http://localhost:3000/vocabulary/1" -ForegroundColor White
        Write-Host "  2. Goi API: http://localhost:5075/api/admin/stats" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "=== LOI KHI SEED DATA ===" -ForegroundColor Red
        Write-Host "Vui long kiem tra loi o tren va thu lai." -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "=== LOI KHI CHAY MIGRATION ===" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
} finally {
    # Quay lai thu muc goc
    Set-Location $PSScriptRoot
}

Write-Host ""
Write-Host "=== HOAN TAT ===" -ForegroundColor Green

