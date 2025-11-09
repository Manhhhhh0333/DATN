# Script de seed Vocabulary Topic HSK1
# Su dung: .\seed-vocabulary-topic.ps1

$apiUrl = "http://localhost:5075/api/admin/seed-vocabulary-topic-hsk1"

Write-Host "Dang seed Vocabulary Topic HSK1..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri $apiUrl -Method POST -ContentType "application/json"
    
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
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Chi tiet loi: $responseBody" -ForegroundColor Red
    }
    
    Write-Host "`nKiem tra:" -ForegroundColor Yellow
    Write-Host "1. Backend dang chay tai http://localhost:5075" -ForegroundColor Yellow
    Write-Host "2. Da seed tu vung HSK1 truoc do" -ForegroundColor Yellow
    Write-Host "3. Database da duoc tao va migration da chay" -ForegroundColor Yellow
}
