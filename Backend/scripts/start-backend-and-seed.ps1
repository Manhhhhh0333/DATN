# Script de khoi dong backend va seed Vocabulary Topic
# Su dung: .\start-backend-and-seed.ps1

Write-Host "Khoi dong Backend API..." -ForegroundColor Yellow

# Kiem tra xem backend da chay chua
$port = 5075
$checkConnection = Test-NetConnection -ComputerName localhost -Port $port -InformationLevel Quiet -WarningAction SilentlyContinue

if ($checkConnection) {
    Write-Host "Backend da dang chay tai port $port" -ForegroundColor Green
} else {
    Write-Host "Backend chua chay. Vui long khoi dong backend trong terminal khac:" -ForegroundColor Yellow
    Write-Host "cd Backend/src/HiHSK.Api" -ForegroundColor Cyan
    Write-Host "dotnet run" -ForegroundColor Cyan
    Write-Host "`nHoac nhan Enter de tiep tuc seed (neu backend da chay o port khac)..." -ForegroundColor Yellow
    Read-Host
}

# Doi 2 giay de backend khoi dong xong
Start-Sleep -Seconds 2

# Seed Vocabulary Topic
Write-Host "`nDang seed Vocabulary Topic HSK1..." -ForegroundColor Yellow

$apiUrl = "http://localhost:$port/api/admin/seed-vocabulary-topic-hsk1"

try {
    $response = Invoke-RestMethod -Uri $apiUrl -Method POST -ContentType "application/json" -ErrorAction Stop
    
    Write-Host "`nSeed thanh cong!" -ForegroundColor Green
    Write-Host "Vocabulary Topic ID: $($response.vocabularyTopicId)" -ForegroundColor Cyan
    Write-Host "Tong so tu vung: $($response.totalWords)" -ForegroundColor Cyan
    Write-Host "So tu da them: $($response.addedWords)" -ForegroundColor Cyan
    Write-Host "So tu da ton tai: $($response.existingWords)" -ForegroundColor Cyan
    
    Write-Host "`nBay gio ban co the truy cap: http://localhost:3000/vocabulary/1" -ForegroundColor Green
}
catch {
    Write-Host "`nLoi khi seed:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Chi tiet loi: $responseBody" -ForegroundColor Red
        } catch {
            Write-Host "Khong the doc chi tiet loi" -ForegroundColor Yellow
        }
    }
    
    Write-Host "`nKiem tra:" -ForegroundColor Yellow
    Write-Host "1. Backend dang chay tai http://localhost:$port" -ForegroundColor Yellow
    Write-Host "2. Da seed tu vung HSK1 truoc do (chay migration SeedHSK1Data)" -ForegroundColor Yellow
    Write-Host "3. Database da duoc tao va migration da chay" -ForegroundColor Yellow
}

