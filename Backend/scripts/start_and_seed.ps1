# Script de khoi dong Backend API va seed du lieu
# Tac gia: HiHSK Development Team

Write-Host "=== KHOI DONG BACKEND API VA SEED DATA ===" -ForegroundColor Green
Write-Host ""

# Kiem tra Backend API co dang chay khong
$apiUrl = "http://localhost:5075/api/admin"
try {
    $response = Invoke-WebRequest -Uri "$apiUrl/stats" -Method Get -UseBasicParsing -ErrorAction Stop -TimeoutSec 2
    Write-Host "[OK] Backend API da dang chay" -ForegroundColor Green
    Write-Host ""
    
    # Neu Backend API da chay, chay script seed
    Write-Host "Chay script seed data..." -ForegroundColor Yellow
    & "$PSScriptRoot\seed_data_via_api.ps1"
    exit 0
} catch {
    Write-Host "[INFO] Backend API chua chay, dang khoi dong..." -ForegroundColor Yellow
    Write-Host ""
}

# Di chuyen den thu muc Backend API
$apiPath = Join-Path $PSScriptRoot "..\src\HiHSK.Api"
if (-not (Test-Path $apiPath)) {
    Write-Host "[ERROR] Khong tim thay thu muc Backend API: $apiPath" -ForegroundColor Red
    exit 1
}

Set-Location $apiPath
Write-Host "Thu muc: $apiPath" -ForegroundColor White
Write-Host ""

# Khoi dong Backend API trong background
Write-Host "Dang khoi dong Backend API..." -ForegroundColor Yellow
Write-Host "Vui long cho Backend API khoi dong hoan toan (khoang 10-15 giay)..." -ForegroundColor Yellow
Write-Host ""

$job = Start-Job -ScriptBlock {
    Set-Location $using:apiPath
    dotnet run
}

# Cho Backend API khoi dong
Write-Host "Dang cho Backend API khoi dong..." -ForegroundColor Yellow
$maxWait = 30
$waited = 0
$apiReady = $false

while ($waited -lt $maxWait) {
    Start-Sleep -Seconds 2
    $waited += 2
    
    try {
        $response = Invoke-WebRequest -Uri "$apiUrl/stats" -Method Get -UseBasicParsing -ErrorAction Stop -TimeoutSec 2
        $apiReady = $true
        Write-Host "[OK] Backend API da san sang!" -ForegroundColor Green
        Write-Host ""
        break
    } catch {
        Write-Host "." -NoNewline -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host ""

if (-not $apiReady) {
    Write-Host "[ERROR] Backend API khong khoi dong duoc sau $maxWait giay" -ForegroundColor Red
    Write-Host "Vui long kiem tra logs hoac khoi dong thu cong:" -ForegroundColor Yellow
    Write-Host "  cd Backend\src\HiHSK.Api" -ForegroundColor White
    Write-Host "  dotnet run" -ForegroundColor White
    Stop-Job $job -ErrorAction SilentlyContinue
    Remove-Job $job -ErrorAction SilentlyContinue
    exit 1
}

# Chay script seed data
Write-Host "Chay script seed data..." -ForegroundColor Yellow
Write-Host ""
& "$PSScriptRoot\seed_data_via_api.ps1"

Write-Host ""
Write-Host "[INFO] Backend API dang chay trong background job." -ForegroundColor Yellow
Write-Host "De dung Backend API, chay lenh:" -ForegroundColor Yellow
Write-Host "  Get-Job | Stop-Job" -ForegroundColor White
Write-Host "  Get-Job | Remove-Job" -ForegroundColor White
Write-Host ""

